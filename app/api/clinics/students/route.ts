import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
// Note: Depending on NextAuth version/config, you might need to import the options
// For now, we'll assume a basic session check

export async function GET() {
  try {
    // In a real app, get clinicId from session
    // const session = await getServerSession();
    // const clinicId = session?.user?.clinicId || 'cl_default';
    const clinicId = 'cl_default';

    const students = await prisma.student.findMany({
      where: { clinicId },
      include: {
        sessions: {
          orderBy: { completedAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Map to UI-friendly format
    const formatted = students.map((s: any) => {
      const lastSession = s.sessions[0];
      const profile = s.profileData ? JSON.parse(s.profileData) : {};
      
      return {
        id: s.id,
        name: s.name,
        age: s.age || '--',
        lastTest: lastSession ? lastSession.completedAt.toISOString().split('T')[0] : 'لا يوجد',
        risk: lastSession ? (lastSession.rawScore < 40 ? 'high' : lastSession.rawScore < 70 ? 'medium' : 'low') : 'low',
        type: lastSession ? lastSession.testTitle : (profile.difficultiesIn ? Object.keys(profile.difficultiesIn).filter(k => profile.difficultiesIn[k])[0] : 'فحص شامل')
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('❌ Fetch Students Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
