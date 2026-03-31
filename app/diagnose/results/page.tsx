// ... (داخل ملف النتائج الحالي)
import BasirRobot from '@/app/components/BasirRobot';
export default function FinalReport() {
  // ... (نفس كود البيانات السابق)

  const getRobotMessage = () => {
    const avg = 70; // افتراضياً، هون بتحط معدل كل السكورات
    if (avg >= 80) return "يا بطل يا [NAME]! نتائجك مذهلة، أنت تمتلك قدرات خارقة حقاً! 🌟";
    if (avg >= 50) return "عمل رائع يا [NAME]، مستواك جيد جداً وسنعمل سوياً لنصبح أفضل! 💪";
    return "لا تقلق يا [NAME]، أنا هنا بجانبك.. سنخوض مغامرات تدريبية ممتعة لنقوي مهاراتك! ✨";
  };

  return (
    <main className="...">
      {/* استدعاء الروبوت */}
      <BasirRobot message={getRobotMessage()} />

      {/* باقي محتوى التقرير الهولوغرافي */}
      <div className="relative z-10">
         {/* ... */}
      </div>
    </main>
  );
}