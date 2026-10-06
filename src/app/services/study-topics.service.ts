import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';

export interface StudyTopic {
  id: string;
  title: string;
  category: string;
  readingTime: string;
  summary: string;
  content: string;
  completed: boolean;
  accentColor: string;
  createdAt: number;
}

export type TopicFilter = 'all' | 'pending' | 'completed';

@Injectable({
  providedIn: 'root'
})
export class StudyTopicsService {
  private readonly STORAGE_KEY = 'smind_study_topics_master_v4';
  private _storage: Storage | null = null;

  private initialTopics: StudyTopic[] = [
    {
      id: 'topic-ionic-core-1',
      title: 'الهيكل العظمي لصفحات Ionic (الهيدر، التولبار، والمحتوى بالتفصيل)',
      category: 'أساسيات Ionic الأساسية',
      readingTime: '7 دقائق',
      summary: 'شرح معماري دقيق لعناصر ion-app و ion-header و ion-toolbar و ion-content ونظام الـ Slots والمناطق الآمنة.',
      content: `📌 1. الحاوية الكبرى <ion-app>:
- ما هي؟ هي المكون الجذري (Root Component) الذي يغلف أي تطبيق Ionic في ملف app.component.html.
- وظيفتها:
  1) تفعيل محرك الأنماط المعيارية (Material Design للأندرويد و Cupertino للـ iOS).
  2) إدارة طبقات النوافذ العائمة (Modals, Alerts, Action Sheets, Toast) في أعلى مستوى (Top Layer).
  3) توفير البيئة اللازمة لمكون <ion-router-outlet> لإجراء انتقالات التنقل الحركية (Page Transitions).

📌 2. رأس الصفحة <ion-header> و <ion-toolbar>:
- ما هو <ion-header>؟
  عنصر حاوٍ مخصص يثبت في قمة الشاشة (Fixed at Top). على عكس <header> في HTML العادي، ion-header يراعي تلقائياً حافة نوتش الموبايل (Notch) وشريط حالة النظام (Status Bar).
- ما هو <ion-toolbar>؟
  شريط الأدوات الفعلي الذي يحمل العنوان والأزرار.
- خاصية [translucent]="true":
  تجعل شريط الأدوات شبه شفاف بنمط زجاجي (Frosted Glass) يعكس محتوى الصفحة الذي يمر تحته أثناء التمرير في نظام iOS.
- ما هو نظام الـ Slots (نظام الفتحات)؟
  Ionic يعتمد على الـ Web Components Slots لتحديد موقع العناصر بدقة:
  * slot="start": يضع العنصر في بداية الشريط (في اليمين في اللغات العربية RTL، أو في اليسار في LTR). مثل أزرار الرجوع والقوائم.
  * slot="end": يضع العنصر في نهاية الشريط (أزرار الإضافة، الإعدادات، البروفايل).
  * مثال عملي في مشروعنا:
    <ion-buttons slot="start"><ion-button (click)="goBack()">رجوع</ion-button></ion-buttons>

📌 3. قلب الصفحة والمحتوى <ion-content>:
- ما هو <ion-content>؟
  هو الحاوية الأساسية المسؤولة عن تمرير محتوى الصفحة (Scrollable Container).
- خصائص حاسمة تميزه عن <div> العادي:
  1) [fullscreen]="true": يسمح للمحتوى بالامتداد خلف الـ Header والـ Footer، وهو ما استغللناه لجعل الكانفاس يغطي كامل الشاشة 100vh.
  2) التعامل مع Shadow DOM عبر CSS Variables:
     لأن ion-content يمتلك داخله Shadow Root خاص بالـ Scroll، لا يمكنك تغيير خلفيته بـ background العادي، بل يجب استخدام المتغير المخصص:
     --background: transparent;
     --padding-bottom: 90px;
  3) حماية المناطق الآمنة (Safe Area Insets):
     يحمي المحتوى من الاختفاء تحت شريط المهام في الآيفون أو حواف الهواتف الحديثة بدون تدخل برمجي يدوي.`,
      completed: true,
      accentColor: '#38bdf8',
      createdAt: Date.now() - 700000,
    },
    {
      id: 'topic-ionic-components-2',
      title: 'دليل مكونات Ionic التفاعلية في المشروع (Range, Card, Button, Modal, Searchbar)',
      category: 'مكونات Ionic بالتفصيل',
      readingTime: '8 دقائق',
      summary: 'شرح تفصيلي لكل مكون استخدمناه في المشروع، خصائصه، متغيرات الـ CSS الخاصة به، وكيف وظفناه.',
      content: `📌 1. البطاقات المعمارية <ion-card>:
- العائلة: <ion-card> و <ion-card-header> و <ion-card-title> و <ion-card-content>.
- لماذا نستخدمها؟ توفر تباعداً وتجميعاً دلالياً رائعاً للمحتوى مع حواف دائرية وظلال مريحة للعين.
- كيف وظفناها في مشروعنا؟
  أعطينا البطاقات كلاس .glass-card وحولناها إلى بطاقات زجاجية معتمة (backdrop-filter: blur(14px))، فأصبحت ألوان الكانفاس المضيئة تتدفق بانسيابية خلفها دون حجب نصوص الدروس.

📌 2. مؤشر التحكم المنزلق <ion-range>:
- ما هو؟ مدخل تفاعلي يسمح باختيار قيم رقمية بسحب المقبض (Knob).
- كيف وظفناه؟
  1) التحكم في عدد خطوط الكانفاس (Trails: 6 إلى 40).
  2) التحكم في معامل الاحتكاك (Friction: 0.2 إلى 0.8).
  3) التحكم في شفافية الألوان (Opacity: 5% إلى 85%).
  4) شريط التقديم والترجيع الصوتي ومستوى الصوت في الـ Audio Player.
- أهم متغيرات الـ CSS المستخدمة:
  --bar-background: لون مسار الشريط غير المفعل.
  --bar-background-active: لون الجزء المقطوع من الشريط.
  --knob-background: لون المقبض الدائري الذي يسحبه المستخدم.

📌 3. الأزرار <ion-button> و <ion-buttons>:
- <ion-buttons>: حاوية لتجميع الأزرار داخل شريط الأدوات (Toolbar).
- خصائص <ion-button>:
  * fill="solid": زر ممتلئ بلون أساسي.
  * fill="outline": زر ذو حدود مفرغة.
  * expand="block": جعل الزر يأخذ عرض الحاوية بالكامل بحواف دائرية.
  * slot="start" / slot="end": وضع الأيقونات بداخل الزر قبل أو بعد النص.

📌 4. النوافذ المنبثقة <ion-modal>:
- كيف تم استخدامها في موديول التعلم لإضافة وتعديل الدروس؟
  تم استخدام النمط العصري الموجه بالقيمة:
  <ion-modal [isOpen]="isModalOpen" (didDismiss)="closeModal()">
    <ng-template> ... محتوى النموذج ... </ng-template>
  </ion-modal>
- الفائدة: لا يتم إنشاء عناصر النموذج في الـ DOM إلا عند فتح المودال، مما يحافظ على خفة الذاكرة وسرعة التطبيق.

📌 5. شريط البحث <ion-searchbar>:
- تميزه عن <input> العادي: يحتوي على أيقونة بحث مدمجة، زر مسح تلقائي، وميزة التهدئة [debounce]="150" التي تؤخر فلترة النتائج 150 ميلي ثانية أثناء الكتابة حتى لا يجهد المعالج مع كل حرف.`,
      completed: true,
      accentColor: '#a855f7',
      createdAt: Date.now() - 600000,
    },
    {
      id: 'topic-canvas-anatomy-3',
      title: 'تشريح كود الـ Canvas Cursor خطوة بخطوة (Component & Math Anatomy)',
      category: 'رسوميات الويب والفيزياء',
      readingTime: '9 دقائق',
      summary: 'تحليل السطور البرمجية لـ CanvasCursorComponent: المعادلات الفيزيائية، Retina Display، و NgZone.',
      content: `📌 1. تعريف المكون (Component Decorator):
@Component({
  selector: 'app-canvas-cursor',
  standalone: true,
  template: '<canvas #cursorCanvas class="canvas-cursor-bg"></canvas>'
})
- مستقل (Standalone: true): يمكن استدعاؤه واستخدامه في أي صفحة أو موديول فوراً.
- pointer-events: none: خاصية حاسمة تضمن أن الكانفاس يرسم على الشاشة بالكامل دون أن يمنع أو يعطل النقر على أي زر أو رابط أو انبثاق أي قائمة.

📌 2. دور @ViewChild و ElementRef:
@ViewChild('cursorCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
يتيح الوصول المباشر لعنصر الكانفاس في الـ DOM واستخراج سياق الرسم ثنائي الأبعاد ctx = canvas.getContext('2d').

📌 3. دقة الشاشات عالية الكثافة (Retina / High-DPI Display):
في دالة resizeCanvas():
const dpr = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;
this.ctx.scale(dpr, dpr);
لماذا؟ لأن شاشات الهواتف الحديثة تعرض 2 أو 3 بيكسل عتادي لكل بيكسل CSS، وبدون ضرب الأبعاد في dpr وتكبير المقياس بـ scale، كانت الخطوط ستظهر باهتة ومبكسلة (Blurry).

📌 4. عزل الأداء بـ NgZone:
this.ngZone.runOutsideAngular(() => { this.initCanvas(); });
السر في تحقيق 60 إلى 120 FPS؛ تشغيل استماع الماوس واللمس ورسم الإطارات بـ requestAnimationFrame بعيداً عن مراقبة Zone.js.

📌 5. حساب الألوان التفاعلية الشفافة:
getStrokeColor():
hsla(hue, 65%, 60%, this.config.opacity)
توليد ألوان نيون حية مع تطبيق الشفافية المخصصة (من 5% إلى 85%) التي ضبطها المستخدم في شاشة Studio.`,
      completed: true,
      accentColor: '#22c55e',
      createdAt: Date.now() - 500000,
    },
    {
      id: 'topic-audio-anatomy-4',
      title: 'تشريح مشغل الصوت وإدارة الـ Queue (Audio Player Anatomy)',
      category: 'صوتيات الويب والوسائط',
      readingTime: '6 دقائق',
      summary: 'كيف تم بناء خدمة الصوت المركزية، تشغيل الملفات بدون إنترنت، وربط ملفات المستخدم المحلية بـ Blob URLs.',
      content: `📌 1. المعمارية الأحادية (Singleton Service):
@Injectable({ providedIn: 'root' })
تضمن وجود نسخة وحيدة (Single Instance) من كائن HTMLAudioElement على مستوى التطبيق بالكامل. لو تنقل المستخدم بين Playground و Studio و Learning، يستمر الصوت بالعزف دون إعادة تشغيل أو انقطاع.

📌 2. توليد روابط الملفات المحلية (URL.createObjectURL):
عند اختيار المستخدم لأغاني أو مقاطع من جهازه:
const objectUrl = URL.createObjectURL(file);
- الفائدة: المتصفح يمنحنا رابطاً مؤقتاً يبدأ بـ blob: يشير للذاكرة المحلية للجهاز مباشرة.
- النتيجة: يعمل المقطع الصوتي لحظياً بدون الحاجة لرفعه على الإنترنت أو تخزينه في سيرفر.

📌 3. إدارة قائمة التشغيل (Queue Operations):
- التقديم والتأخير (Reorder):
  خوارزمية Array.splice لتبديل المواقع مع الحفاظ على مؤشر المقطع النشط (Current Index).
- الحذف مع تنظيف الذاكرة:
  عند حذف ملف محلي، نقوم باستدعاء URL.revokeObjectURL(url) لتحرير الذاكرة العشوائية للجهاز فوراً.
- التكرار التلقائي (Loop Mode):
  عند انتهاء المقطع الحالي (الحدث ended):
  * في وضع 'one': يعاد تعيين currentTime = 0 ويعاد العزف.
  * في وضع 'all': يتم الانتقال للمقطع التالي (index + 1) % length.`,
      completed: false,
      accentColor: '#f59e0b',
      createdAt: Date.now() - 400000,
    },
    {
      id: 'topic-crud-storage-5',
      title: 'هندسة الـ CRUD والتخزين الدائم (Ionic Storage & Reactive State Anatomy)',
      category: 'إدارة الحالة وقواعد البيانات',
      readingTime: '7 دقائق',
      summary: 'تحليل دقيق لخدمة StudyTopicsService، نمط الـ Reactive State بـ BehaviorSubject، واستمرارية البيانات بـ Ionic Storage.',
      content: `📌 1. النمط التفاعلي (Reactive State Pattern):
- لماذا نستخدم BehaviorSubject<StudyTopic[]>؟
  1) يحتفظ بالقيمة الحالية دائماً (Current Value).
  2) عند فتح أي شاشة جديدة تشترك في topics$، تحصل فوراً على أحدث قائمة دروس دون تأخير.
  3) عند أي عملية CRUD، نرسل القائمة الجديدة بـ next()، فتقوم كافة مكونات الواجهة بتحديث نفسها تلقائياً وبكفاءة.

📌 2. التكامل مع Ionic Storage:
- التهيئة غير المتزامنة (Async Initialization):
  const storage = await this.storage.create();
  this._storage = storage;
- الحفظ والاسترجاع:
  await this._storage.set(KEY, topics);
  await this._storage.get(KEY);
- لماذا يتفوق على LocalStorage؟
  * LocalStorage متزامن ويسد المسار الرئيسي ويتحمل 5MB كحد أقصى.
  * Ionic Storage يعتمد على IndexedDB / SQLite، غير متزامن، ويتحمل مئات الميجابايت دون قيود.

📌 3. عمليات الـ CRUD الكاملة:
- Create: إضافة موضوع جديد مع توليد معرف فريد وطابع زمني Date.now().
- Read: إتاحة القائمة الكاملة مع الفلترة والبحث السريع.
- Update: تعديل نصوص الموضوع أو حالة الـ Checkbox وإعادة الحفظ.
- Delete: تصفية القائمة بـ Array.filter وحفظ النتيجة في الـ Storage.`,
      completed: false,
      accentColor: '#ec4899',
      createdAt: Date.now() - 300000,
    },
    {
      id: 'topic-ui-grid-6',
      title: 'هندسة الـ SCSS والتصميم العصري (2-Column Grid & Glassmorphism)',
      category: 'تصميم الواجهات UI/UX',
      readingTime: '5 دقائق',
      summary: 'كيف بنينا شبكة الكروت الثنائية المنتظمة، أسرار ثبات الارتفاع بـ Line-Clamp، وتصميم الـ Glassmorphism.',
      content: `📌 1. شبكة الكروت الثنائية (CSS Grid 2-Columns):
.topics-cards-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
- لماذا تفوقت على الـ Flexbox؟
  الـ Grid يضمن تساوي أبعاد الأعمدة تلقائياً دون تداخل، ويعطي تجربة متناسقة سواء على شاشات الموبايل أو شاشات سطح المكتب.

📌 2. سر استواء ارتفاع الكروت (-webkit-line-clamp):
عند اختلاف أطوال عناوين أو ملخصات الدروس، قد تصبح الكروت غير متساوية في الطول وتشوه المظهر.
الحل السحري:
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;
يقوم هذا الكود بقص النصوص التي تزيد عن سطرين وإضافة ثلاث نقاط (...) بنعومة، مما يحافظ على استواء وانتظام الكروت بنسبة 100%.

📌 3. أسرار الـ Glassmorphism الداكن:
- خلفية شبه شفافة: rgba(15, 23, 42, 0.72).
- تمويه الخلفية: backdrop-filter: blur(14px).
- حدود رفيعة مضيئة: border: 1px solid rgba(255, 255, 255, 0.08).
تسمح هذه المعادلة للكانفاس المضيء بالظهور خلف العناصر دون أن يفقد النص وضوحه وقابليته للقراءة.`,
      completed: false,
      accentColor: '#6366f1',
      createdAt: Date.now() - 200000,
    },
    {
      id: 'topic-deploy-guide-7',
      title: 'سيكل بناء ورفع المشاريع (Web, Local APK, Google Play Guide)',
      category: 'هندسة DevOps والنشر',
      readingTime: '8 دقائق',
      summary: 'الدليل التقني الكامل لأوامر البناء للإنتاج، الرفع على Vercel، حل مشكلة JDK 26 في Gradle، وتوليد ملفات APK و AAB.',
      content: `📌 1. الفرق بين كود التطوير وكود الإنتاج:
كود التطوير يحتوي على أدوات التصحيح (Source Maps) وأكواد غير مضغوطة. أمر npm run build يشغل Angular AOT Compiler ويقوم بـ Tree-shaking و Minification لتقليص الحجم بأكثر من 70% وإخراج مجلد www.

🌐 2. رفع الويب على Vercel:
الأمر: vercel --prod
المجلد المرفوع: www
الناتج: رابط عالمي مجاني فائق السرعة يدعم الـ Single Page Application.

📱 3. بناء APK الموبايل المباشر (بدون متجر):
1) مزامنة كود الويب مع مجلد الأندرويد:
   npx cap sync android
2) بناء ملف الـ APK عبر Gradle:
   cd android
   $env:JAVA_HOME = "C:\\Program Files\\Android\\Android Studio\\jbr"
   .\\gradlew.bat assembleDebug
3) الملف الناتج الجاهز للتثبيت الفوري:
   android/app/build/outputs/apk/debug/app-debug.apk

⚠️ حل مشكلة تعارض Java 26:
كان AGP يفشل مع JDK 26 التجريبي الأحدث عند تشغيل أداة jlink. وجهنا JAVA_HOME إلى مسار OpenJDK 25/21 المعتمد المدمج مع أندرويد ستوديو (JBR)، فنجح البناء وخرج ملف APK بحجم خفيف 8.4MB.

🚀 4. الرفع إلى Google Play Store:
- إنشاء مفتاح التوقيع الرقمي:
  keytool -genkey -v -keystore release.keystore -alias smind -keyalg RSA -keysize 2048 -validity 10000
- بناء حزمة الإنتاج:
  .\\gradlew.bat bundleRelease  (ينتج ملف app-release.aab المرفوع للمتجر).`,
      completed: false,
      accentColor: '#4ade80',
      createdAt: Date.now() - 100000,
    },
    {
      id: 'topic-focus-psychology-8',
      title: 'سيكولوجية الألوان وامتصاص التشتت الحركي (Kinesthetic Visual Focus)',
      category: 'علم النفس والتركيز',
      readingTime: '5 دقائق',
      summary: 'الأساس العلمي لظاهرة الفيدجيتينج البصري، وكيف تؤثر الترددات الضوئية للألوان على تهدئة العقل وزيادة التركيز.',
      content: `📌 1. الأساس العصبي لامتصاص التشتت:
عند قراءة نصوص طويلة أو دراسة كود معقد، يبحث العقل اللاواعي عن أي تفريغ للطاقة الحركية (Fidgeting).
حركة الخطوط والكانفاس المستجيبة للمس والماوس تقدم "تفريغاً حركياً بصرياً" (Kinesthetic Visual Outlet)، فيهدأ التشتت وتستقر العين في تتبع الكلمات دون شرود ذهني.

📌 2. سيكولوجية الألوان وتأثيرها على المواد:
- النيون السماوي (Cyan): يحفز التيقظ والتحليل المنطقي؛ مثالي للبرمجة والرياضيات وحل المشاكل المعقدة.
- البنفسجي الهادئ (Violet): يخفض معدل ضربات القلب ويقلل توتر الامتحانات ومثالي للمواد النظرية والقراءة الطويلة.
- الذهبي الدافئ (Warm Gold): يريح شبكية العين ليلاً ويمنع إجهاد البصر ويحافظ على إفراز هرمون النوم (الميلاتونين).
- قوس قزح (Rainbow): يكسر الروتين ويحفز الدوبامين الطبيعي لتجديد النشاط في الجلسات الدراسية الممتدة.`,
      completed: false,
      accentColor: '#38bdf8',
      createdAt: Date.now(),
    }
  ];

  private topicsSubject = new BehaviorSubject<StudyTopic[]>([]);
  public topics$: Observable<StudyTopic[]> = this.topicsSubject.asObservable();

  private filterSubject = new BehaviorSubject<TopicFilter>('all');
  public filter$: Observable<TopicFilter> = this.filterSubject.asObservable();

  constructor(private storage: Storage) {
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    try {
      const storage = await this.storage.create();
      this._storage = storage;
      const stored = await this._storage.get(this.STORAGE_KEY);
      if (stored && Array.isArray(stored) && stored.length > 0) {
        this.topicsSubject.next(stored);
        return;
      }
    } catch (err) {
      console.warn('Error initializing Ionic Storage, falling back to localStorage:', err);
      try {
        const fallback = localStorage.getItem(this.STORAGE_KEY);
        if (fallback) {
          const parsed = JSON.parse(fallback);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.topicsSubject.next(parsed);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // Default seed with our full master study curriculum
    this.topicsSubject.next(this.initialTopics);
    this.saveToStorage(this.initialTopics);
  }

  private async saveToStorage(topics: StudyTopic[]): Promise<void> {
    try {
      if (this._storage) {
        await this._storage.set(this.STORAGE_KEY, topics);
      } else {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topics));
      }
    } catch (err) {
      console.warn('Could not save topics to Ionic Storage:', err);
    }
  }

  public get currentTopics(): StudyTopic[] {
    return this.topicsSubject.value;
  }

  public setFilter(filter: TopicFilter): void {
    this.filterSubject.next(filter);
  }

  public toggleCompletion(id: string): void {
    const list = this.currentTopics.map((item) => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    this.topicsSubject.next(list);
    this.saveToStorage(list);
  }

  public addTopic(topic: Omit<StudyTopic, 'id' | 'createdAt'>): StudyTopic {
    const newTopic: StudyTopic = {
      ...topic,
      id: `topic-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };
    const list = [newTopic, ...this.currentTopics];
    this.topicsSubject.next(list);
    this.saveToStorage(list);
    return newTopic;
  }

  public updateTopic(id: string, partial: Partial<StudyTopic>): void {
    const list = this.currentTopics.map((item) => {
      if (item.id === id) {
        return { ...item, ...partial };
      }
      return item;
    });
    this.topicsSubject.next(list);
    this.saveToStorage(list);
  }

  public deleteTopic(id: string): void {
    const list = this.currentTopics.filter((item) => item.id !== id);
    this.topicsSubject.next(list);
    this.saveToStorage(list);
  }

  public getTopicById(id: string): StudyTopic | undefined {
    return this.currentTopics.find((t) => t.id === id);
  }

  public async refreshTopics(): Promise<void> {
    await this.initStorage();
  }
}
