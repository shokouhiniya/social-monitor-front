'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const GUIDE_SECTIONS = [
  {
    id: 'overview',
    title: 'معرفی سامانه',
    icon: 'solar:home-bold-duotone',
    color: 'primary',
    content: `این سامانه یک «مرکز هوش رسانه‌ای» است که فاصله بین داده‌ی خام شبکه‌های اجتماعی و تصمیم‌گیری استراتژیک را پر می‌کند. شما می‌توانید هزاران پیج اینستاگرام، توییتر و تلگرام را تحت پایش قرار دهید و با کمک هوش مصنوعی، تحلیل‌های عمیق دریافت کنید.`,
    steps: [
      'ابتدا پیج‌ها را از بخش «پیج‌ها» اضافه کنید (تکی یا با ایمپورت اکسل)',
      'سپس با دکمه «بارگیری» پست‌ها و اطلاعات پروفایل را از شبکه اجتماعی دریافت کنید',
      'با دکمه «تحلیل هوشمند» اطلاعات را به هوش مصنوعی بدهید تا تحلیل شود',
      'نتایج در داشبورد کلان، پروفایل هر پیج و گزارش‌ها نمایش داده می‌شود',
    ],
  },
  {
    id: 'dashboard',
    title: 'داشبورد کلان',
    icon: 'solar:chart-bold-duotone',
    color: 'info',
    content: `داشبورد کلان نمای «اتاق فرمان» شماست. در یک نگاه وضعیت کل شبکه را می‌بینید.`,
    subsections: [
      {
        title: 'انتخاب‌گر دامنه (Scope)',
        desc: 'بالای صفحه می‌توانید بین «نمایندگان شبکه»، «یک خوشه خاص» یا «کل شبکه» سوییچ کنید. تمام نمودارها و شاخص‌ها بر اساس دامنه انتخابی فیلتر می‌شوند.',
      },
      {
        title: 'خلاصه AI',
        desc: 'یک جمله هوشمند که وضعیت لحظه‌ای شبکه را خلاصه می‌کند. هر ۵ دقیقه به‌روز می‌شود.',
      },
      {
        title: 'گزارش دوره‌ای',
        desc: 'گزارش متنی از وضعیت شبکه در بازه زمانی انتخابی (۲۴ ساعت تا ۱ ماه). می‌توانید با دکمه «تولید با AI» گزارش عمیق‌تری بگیرید.',
      },
      {
        title: 'ضربان شبکه (Pulse Strip)',
        desc: 'نوار بالای صفحه که تعداد پست‌های ۲۴ ساعت اخیر را ساعت‌به‌ساعت نشان می‌دهد.',
      },
      {
        title: 'شاخص‌های کلیدی',
        desc: '۴ کارت: تعداد پیج‌ها، شاخص هم‌گرایی، هم‌راستایی هفته، شاخص فعالیت.',
      },
      {
        title: 'نقشه جغرافیایی',
        desc: 'پراکندگی جغرافیایی پیج‌ها روی نقشه جهان. اندازه دایره = تعداد پست، رنگ = حجم بازدید.',
      },
    ],
  },
  {
    id: 'narrative-health',
    title: 'سنجش سلامت روایت',
    icon: 'solar:target-bold-duotone',
    color: 'success',
    content: `این ماژول بررسی می‌کند که چقدر محتوای شبکه شما با «روایت مطلوب» هم‌راستا است.`,
    howItWorks: 'سیستم کلمات کلیدی ۷ روز اخیر را استخراج می‌کند و با «کلمات کلیدی روایت» (که در تنظیمات تعریف کرده‌اید) مقایسه می‌کند. درصد تطابق = سلامت روایت.',
    example: {
      scenario: 'فرض کنید روایت مطلوب شما «حمایت از فلسطین» است و کلمات کلیدی تعریف‌شده: غزه، فلسطین، مقاومت، آزادی',
      result: 'اگر ۷۰٪ پست‌های هفته اخیر شامل این کلمات باشند → سلامت روایت = ۷۰٪ (سبز)',
      action: 'اگر زیر ۴۰٪ بیفتد → هشدار نارنجی: «شبکه از روایت اصلی فاصله گرفته»',
    },
    settings: 'برای تنظیم کلمات کلیدی روایت: تنظیمات → روایت و تحلیل محتوا → «کلمات کلیدی روایت»',
  },
  {
    id: 'silence-radar',
    title: 'رادار سکوت',
    icon: 'solar:eye-bold-duotone',
    color: 'error',
    content: `رادار سکوت نشان می‌دهد شبکه شما نسبت به کدام موضوعات مهم جهانی «سکوت» کرده است.`,
    howItWorks: 'شما لیستی از موضوعات داغ جهانی را وارد می‌کنید (مثلاً: غزه، انتخابات آمریکا، تغییرات اقلیمی). سیستم بررسی می‌کند کدام موضوعات در پست‌های شبکه شما پوشش داده شده و کدام نه.',
    example: {
      scenario: 'موضوعات وارد شده: غزه، اقتصاد غزه، انتخابات آمریکا، هوش مصنوعی، بحران یمن',
      result: 'غزه ✓ (۱۲۰ پست) | اقتصاد غزه ✗ (۰ پست) | انتخابات آمریکا ✓ (۴۵ پست) | هوش مصنوعی ✗ (۲ پست) | بحران یمن ✗ (۰ پست)',
      action: 'شکاف‌های قرمز = فرصت تولید محتوا. می‌توانید هشدار استراتژیک صادر کنید.',
    },
    settings: 'موضوعات پیش‌فرض در خود کامپوننت قابل ویرایش است. کافیست موضوعات را با کاما جدا کنید و دکمه «تحلیل» را بزنید.',
  },
  {
    id: 'page-profile',
    title: 'پروفایل پیج (تحلیل فردی)',
    icon: 'solar:user-id-bold-duotone',
    color: 'warning',
    content: `برای هر پیج یک «شناسنامه هوشمند» وجود دارد که فراتر از آمار ساده است.`,
    subsections: [
      {
        title: '۵ شاخص اصلی',
        desc: 'اعتبار، نفوذ، پایداری، همراهی، همسویی — هر کدام از ۰ تا ۱۰ امتیاز دارند و توسط AI محاسبه می‌شوند.',
      },
      {
        title: 'رادار شخصیت',
        desc: 'نمودار ۶ محوری: تهاجمی/دفاعی، تولیدکننده/بازنشردهنده، بصری/متنی، رسمی/غیررسمی، محلی/جهانی، تعاملی/یک‌طرفه.',
      },
      {
        title: 'مرکز عملیات',
        desc: 'بینش ۳۶۰ درجه (دغدغه‌ها، کلمات کلیدی، گزارش‌های میدانی) + کارت‌های عملیاتی (Action Plans).',
      },
      {
        title: 'تایم‌لاین',
        desc: 'نمودار توزیع روزانه پست‌ها + تحلیل احساسات در طول زمان + روایت پست‌ها.',
      },
      {
        title: 'بازه زمانی تحلیل',
        desc: 'می‌توانید بازه تحلیل را از ۲۴ ساعت تا «همه» تغییر دهید. با هر تغییر، شاخص‌ها مجدداً محاسبه می‌شوند.',
      },
    ],
    steps: [
      'روی نام پیج در جدول کلیک کنید تا وارد پروفایل شوید',
      'اگر پیج هنوز بارگیری نشده، دکمه «بارگیری» را بزنید',
      'بعد از بارگیری، دکمه «پردازش هوشمند» را بزنید تا AI تحلیل کند',
      'نتایج تحلیل در شاخص‌ها، رادار شخصیت و تایم‌لاین نمایش داده می‌شود',
    ],
  },
  {
    id: 'clusters',
    title: 'خوشه‌ها',
    icon: 'solar:atom-bold-duotone',
    color: 'secondary',
    content: `خوشه‌ها ابزار گروه‌بندی پیج‌ها هستند. می‌توانید پیج‌ها را بر اساس موضوع، جغرافیا یا هر معیار دیگری گروه‌بندی کنید.`,
    steps: [
      'از منوی «خوشه‌ها» یک خوشه جدید بسازید',
      'پیج‌ها را به خوشه اضافه کنید',
      'برخی پیج‌ها را به عنوان «نماینده» مشخص کنید (ستاره)',
      'در داشبورد، با Scope Selector می‌توانید فقط داده‌های یک خوشه خاص را ببینید',
    ],
  },
  {
    id: 'alerts',
    title: 'هشدارهای استراتژیک',
    icon: 'solar:bell-bold-duotone',
    color: 'error',
    content: `هشدارها نقاط بحرانی یا فرصت‌های شبکه را نشان می‌دهند.`,
    subsections: [
      {
        title: 'تولید خودکار با AI',
        desc: 'دکمه «تولید هشدار با AI» داده‌های شبکه را تحلیل و ۵ هشدار با اولویت و اقدامات پیشنهادی تولید می‌کند.',
      },
      {
        title: 'ثبت دستی',
        desc: 'می‌توانید هشدار دستی با عنوان، پیام، اولویت و مسئول پیگیری ثبت کنید.',
      },
      {
        title: 'تغییر وضعیت',
        desc: 'هر هشدار ۵ وضعیت دارد: فعال → در حال پیگیری → نیاز به پاسخ → تایید شده → بایگانی.',
      },
      {
        title: 'تعریف عملیات',
        desc: 'از هر هشدار می‌توانید یک «برنامه عملیاتی» (Action Plan) بسازید و به پیج‌های خاص اختصاص دهید.',
      },
    ],
  },
  {
    id: 'field-reports',
    title: 'گزارش‌های میدانی',
    icon: 'solar:document-text-bold-duotone',
    color: 'info',
    content: `گزارش‌های میدانی «لایه انسانی» سامانه هستند — اطلاعاتی که فقط انسان می‌تواند تشخیص دهد.`,
    example: {
      scenario: 'یک آتش‌سوزی در منطقه رخ داده ولی پیج محلی سکوت کرده و مردم در کامنت‌ها شاکی هستند',
      result: 'گزارش ثبت می‌شود → کلمات کلیدی استخراج می‌شود → به پروفایل پیج پین می‌شود',
      action: 'می‌توانید گزارش را به «هشدار استراتژیک» تبدیل کنید',
    },
    steps: [
      'دکمه «ثبت گزارش» را بزنید',
      'پیج مرتبط را انتخاب کنید (اختیاری)',
      'نوع منبع: متن دستی / ویس / فایل',
      'متن گزارش را بنویسید',
      'گزارش ثبت می‌شود و در پروفایل پیج نمایش داده می‌شود',
    ],
  },
  {
    id: 'posts',
    title: 'فید پست‌ها',
    icon: 'solar:gallery-bold-duotone',
    color: 'primary',
    content: `تمام پست‌های شبکه در یک فید هوشمند با فیلترهای پیشرفته نمایش داده می‌شوند.`,
    subsections: [
      {
        title: 'فیلتر سریع',
        desc: 'لحن (خشمگین/امیدوار/خنثی/غمگین)، نوع (image/video/reel/story)، وایرال.',
      },
      {
        title: 'فیلتر پیشرفته',
        desc: 'پلتفرم، خوشه، دسته‌بندی، کشور، بازه زمانی.',
      },
      {
        title: 'نمای خوشه‌ای',
        desc: 'پست‌ها بر اساس موضوع گروه‌بندی می‌شوند (Topic Clusters).',
      },
      {
        title: 'پردازش تکی',
        desc: 'روی هر پست کلیک کنید → دکمه «پردازش هوشمند پست» → AI لحن، موضوعات و کلمات کلیدی را استخراج می‌کند.',
      },
      {
        title: 'توضیح دستی',
        desc: 'برای پست‌هایی که AI نمی‌تواند تفسیر کند (مثلاً ویدیوی بدون کپشن)، می‌توانید توضیح دستی اضافه کنید.',
      },
    ],
  },
  {
    id: 'settings',
    title: 'تنظیمات',
    icon: 'solar:settings-bold-duotone',
    color: 'warning',
    content: `تنظیمات سامانه شامل ۴ بخش اصلی است:`,
    subsections: [
      {
        title: 'توکن‌ها و سرویس‌های خارجی',
        desc: 'کلید API اینستاگرام (RapidAPI)، کلید OpenRouter (برای LLM)، مدل LLM، کلید Soniox (رونوشت صوتی).',
      },
      {
        title: 'روایت و تحلیل محتوا',
        desc: 'کلمات کلیدی روایت مطلوب (برای سنجش سلامت روایت). مثال: غزه، فلسطین، مقاومت، آزادی',
      },
      {
        title: 'پرامپت‌های هوش مصنوعی',
        desc: 'پرامپت سیستمی و دستورات اضافی برای ۳ ماژول: تحلیل پیج، تولید گزارش، تولید هشدار. با تغییر پرامپت‌ها می‌توانید خروجی AI را کنترل کنید.',
      },
      {
        title: 'تنظیمات عمومی',
        desc: 'سایر تنظیمات سیستمی.',
      },
    ],
  },
  {
    id: 'workflow',
    title: 'گردش کار پیشنهادی',
    icon: 'solar:routing-bold-duotone',
    color: 'success',
    content: `برای بهره‌برداری حداکثری از سامانه، این گردش کار را دنبال کنید:`,
    steps: [
      '۱. پیج‌ها را اضافه کنید (ایمپورت اکسل یا تکی)',
      '۲. خوشه‌ها را بسازید و پیج‌ها را گروه‌بندی کنید',
      '۳. نمایندگان هر خوشه را مشخص کنید',
      '۴. دکمه «بارگیری همه» را بزنید (صبر کنید تا تمام شود)',
      '۵. دکمه «تحلیل همه» را بزنید (ممکن است ۱۰-۳۰ دقیقه طول بکشد)',
      '۶. به داشبورد بروید و دکمه «بروزرسانی» را بزنید',
      '۷. گزارش دوره‌ای و هشدارها تولید می‌شوند',
      '۸. هر روز: بارگیری مجدد → تحلیل مجدد → بروزرسانی داشبورد',
    ],
  },
];

// ----------------------------------------------------------------------

function ExampleBox({ example }) {
  if (!example) return null;
  return (
    <Box sx={(theme) => ({ p: 2, mt: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.04), border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}` })}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:lightbulb-bold-duotone" width={18} sx={{ color: 'warning.main' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'warning.main' }}>مثال عملی</Typography>
        </Stack>
        <Typography variant="body2"><strong>سناریو:</strong> {example.scenario}</Typography>
        <Typography variant="body2"><strong>نتیجه:</strong> {example.result}</Typography>
        <Typography variant="body2"><strong>اقدام:</strong> {example.action}</Typography>
      </Stack>
    </Box>
  );
}

export function GuideView() {
  const [expanded, setExpanded] = useState('overview');

  return (
    <DashboardContent maxWidth="lg">
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Box sx={(theme) => ({ width: 56, height: 56, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.12) })}>
          <Iconify icon="solar:book-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>راهنمای سامانه</Typography>
          <Typography variant="body2" color="text.secondary">آشنایی با ماژول‌ها، کامپوننت‌ها و نحوه کار با سامانه پایش رسانه‌ای</Typography>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        {GUIDE_SECTIONS.map((section) => (
          <Accordion
            key={section.id}
            expanded={expanded === section.id}
            onChange={(_, isExpanded) => setExpanded(isExpanded ? section.id : false)}
            sx={(theme) => ({
              border: `1px solid ${alpha(theme.palette[section.color].main, 0.15)}`,
              '&::before': { display: 'none' },
              borderRadius: '12px !important',
              overflow: 'hidden',
            })}
          >
            <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={(theme) => ({ width: 44, height: 44, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette[section.color].main, 0.12) })}>
                  <Iconify icon={section.icon} width={24} sx={{ color: `${section.color}.main` }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{section.title}</Typography>
              </Stack>
            </AccordionSummary>

            <AccordionDetails>
              <Typography variant="body2" sx={{ lineHeight: 2, mb: 2 }}>{section.content}</Typography>

              {/* How it works */}
              {section.howItWorks && (
                <Card sx={(theme) => ({ p: 2, mb: 2, bgcolor: alpha(theme.palette.info.main, 0.04), border: `1px solid ${alpha(theme.palette.info.main, 0.12)}` })}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Iconify icon="solar:cpu-bolt-bold-duotone" width={18} sx={{ color: 'info.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'info.main' }}>نحوه عملکرد</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ lineHeight: 2 }}>{section.howItWorks}</Typography>
                </Card>
              )}

              {/* Subsections */}
              {section.subsections && (
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  {section.subsections.map((sub, idx) => (
                    <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
                      <Chip label={idx + 1} size="small" color={section.color} sx={{ minWidth: 28, height: 24, fontWeight: 700 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{sub.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.8 }}>{sub.desc}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              )}

              {/* Steps */}
              {section.steps && (
                <Card sx={(theme) => ({ p: 2, mb: 2, bgcolor: alpha(theme.palette.success.main, 0.04), border: `1px solid ${alpha(theme.palette.success.main, 0.12)}` })}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <Iconify icon="solar:checklist-bold-duotone" width={18} sx={{ color: 'success.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>مراحل</Typography>
                  </Stack>
                  <Stack spacing={1}>
                    {section.steps.map((step, idx) => (
                      <Stack key={idx} direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={(theme) => ({ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.success.main, 0.12), flexShrink: 0 })}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', fontSize: 10 }}>{idx + 1}</Typography>
                        </Box>
                        <Typography variant="body2">{step}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              )}

              {/* Example */}
              <ExampleBox example={section.example} />

              {/* Settings reference */}
              {section.settings && (
                <Box sx={(theme) => ({ p: 1.5, mt: 2, borderRadius: 1, bgcolor: alpha(theme.palette.grey[500], 0.06), border: `1px dashed ${alpha(theme.palette.grey[500], 0.2)}` })}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:settings-bold" width={16} sx={{ color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">{section.settings}</Typography>
                  </Stack>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </DashboardContent>
  );
}
