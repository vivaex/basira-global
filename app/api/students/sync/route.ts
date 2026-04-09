import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { profile, sessions, missions } = await req.json();

    if (!profile || !profile.name) {
      return NextResponse.json({ error: 'Missing profile data' }, { status: 400 });
    }

    // Ensure Default Clinic exists to satisfy FK constraint
    let targetClinicId = profile.clinicId || 'cl_default';
    const clinicExists = await prisma.clinic.findUnique({ where: { id: targetClinicId } });
    if (!clinicExists) {
      await prisma.clinic.create({
        data: { id: targetClinicId, name: 'Default Research Clinic' }
      });
    }

    // Upsert Student
    const studentId = profile.id && profile.id !== 'new' ? profile.id : `st_${Date.now()}`;
    
    const student = await prisma.student.upsert({
      where: { id: studentId },
      update: {
        name: profile.name,
        age: Number(profile.age) || null,
        gender: profile.gender || 'not_specified',
        grade: profile.grade || '',
        clinicId: targetClinicId,
        profileData: JSON.stringify(profile),
      },
      create: {
        id: studentId,
        name: profile.name,
        age: Number(profile.age) || null,
        gender: profile.gender || 'not_specified',
        grade: profile.grade || '',
        clinicId: targetClinicId, 
        profileData: JSON.stringify(profile),
      },
    });

    // Batch Create Sessions (simple approach)
    if (sessions && Array.isArray(sessions)) {
      for (const s of sessions) {
        await prisma.session.upsert({
          where: { id: s.id },
          update: {}, // No updates for sessions once completed
          create: {
            id: s.id,
            testId: s.testId,
            testCategory: s.testCategory,
            testTitle: s.testTitle,
            rawScore: s.rawScore,
            metrics: JSON.stringify({ attention: s.attention, emotional: s.emotional }),
            completedAt: new Date(s.completedAt),
            studentId: student.id,
          },
        });
      }
    }

    // Sync Missions
    if (missions && Array.isArray(missions)) {
      for (const m of missions) {
        await prisma.missionProgress.upsert({
          where: { 
            missionId_date_studentId: {
              missionId: m.missionId,
              date: m.date,
              studentId: student.id
            }
          },
          update: { isClaimed: m.isClaimed },
          create: {
            missionId: m.missionId,
            date: m.date,
            isClaimed: m.isClaimed,
            studentId: student.id
          }
        });
      }
    }

    return NextResponse.json({ success: true, studentId: student.id });
  } catch (error: any) {
    console.error('❌ Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
