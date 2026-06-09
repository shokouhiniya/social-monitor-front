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
    content: `این سامانه یک «سامانه مدیریت و تحلیل میکرورسانه‌ها» است؛ ترکیبی از یک CRM عملیاتی برای مدیریت رسانه‌ها و یک موتور پایش و تحلیل محتوای شبکه‌های اجتماعی. واحد اصلی کار «میکرورسانه» است: یک هویت رسانه‌ای که می‌تواند چندین حساب پلتفرمی (اینستاگرام، تلگرام و...) داشته باشد. میکرورسانه‌ها زیر «هاب‌ها» (واحدهای سازمانی) دسته‌بندی می‌شوند و کل سامانه — دسترسی‌ها، داشبوردها و گزارش‌ها — حول هاب می‌چرخد.`,
    howItWorks: 'موتور قدیمی Social Monitor (کرال پیج‌ها، جمع‌آوری پست و تحلیل هوش مصنوعی محتوا) حفظ شده و حالا به‌عنوان «موتور پشت‌صحنه» داده‌ی عملکردی و تحلیلی را برای میکرورسانه‌ها فراهم می‌کند. این قابلیت‌ها زیر بخش «پایش محتوا» در دسترس‌اند.',
    steps: [
      'ابتدا هاب‌ها (ساختار سازمانی) را در بخش «هاب‌ها» بسازید',
      'میکرورسانه‌ها را در بخش «میکرورسانه‌ها» ثبت کنید و به هاب نسبت دهید',
      'حساب‌های پلتفرمی (پیج/کانال) را به هر میکرورسانه متصل کنید',
      'تعاملات، امتیازها و تسک‌ها را ثبت کنید و در داشبورد کلان وضعیت کل را ببینید',
    ],
  },
  {
    id: 'dashboard',
    title: 'داشبورد کلان',
    icon: 'solar:chart-bold-duotone',
    color: 'info',
    content: `داشبورد کلان (مسیر «داشبورد کلان» در منو) نمای «اتاق فرمان» مدیریتی شماست و به سؤالات کلیدی PRD پاسخ می‌دهد. هر کارت قابل کلیک است و شما را به صفحه مرتبط می‌برد.`,
    subsections: [
      {
        title: 'کارت‌های وضعیت',
        desc: '۸ کارت کلیدی: کل میکرورسانه‌ها، دارای تعامل اخیر، بدون تعامل در ۶ ماه، بدون امتیاز، بدون هاب، عملیات فعال، تسک‌های باز، تسک‌های عقب‌افتاده.',
      },
      {
        title: 'پوشش هاب‌ها',
        desc: 'جدولی که برای هر هاب تعداد کل میکرورسانه‌ها و تعداد فعال را نشان می‌دهد. به‌سرعت نشان می‌دهد کدام هاب نیاز به توجه دارد.',
      },
      {
        title: 'حوزه‌های با پوشش ضعیف',
        desc: 'حوزه‌های فعالیتی که بیشترین میکرورسانه بدون تعامل را دارند؛ فرصت‌های بازفعال‌سازی را نشان می‌دهد.',
      },
      {
        title: 'میکرورسانه جدید',
        desc: 'دکمه میان‌بر بالای صفحه برای ثبت سریع یک میکرورسانه جدید.',
      },
    ],
  },
  {
    id: 'micro-media',
    title: 'میکرورسانه‌ها',
    icon: 'solar:user-id-bold-duotone',
    color: 'primary',
    content: `میکرورسانه واحد اصلی سامانه است؛ یک «شناسنامه» کامل از هر رسانه شامل هویت، اطلاعات تماس، حوزه فعالیت، حساب‌های پلتفرمی، امتیازها و تاریخچه تعاملات.`,
    subsections: [
      {
        title: 'تب پروفایل',
        desc: 'اطلاعات هویتی: نام، توضیح هویت، حوزه فعالیت، نام رابط و تماس، کشور، زبان و برچسب‌ها.',
      },
      {
        title: 'تب سکوها (حساب‌ها)',
        desc: 'حساب‌های پلتفرمی متصل (پیج اینستاگرام، کانال تلگرام و...) با تعداد دنبال‌کننده. دکمه «بروزرسانی عملکرد» داده‌ی عملکردی را از موتور پایش می‌گیرد.',
      },
      {
        title: 'تب امتیاز رسانه',
        desc: 'ثبت امتیاز انسانی برای ۷ شاخص در دوره جاری + نمایش آخرین امتیاز هر شاخص.',
      },
      {
        title: 'تب تعاملات',
        desc: 'ثبت تعامل جدید (تماس/جلسه/پیام/خدمت/پیگیری) و مشاهده تاریخچه تعاملات این رسانه.',
      },
      {
        title: 'تب پست‌ها و تحلیل محتوا',
        desc: 'پست‌های حساب‌های متصل + دکمه «تکمیل پروفایل از ۲۰ پست آخر» که بر اساس تحلیل موجود، حوزه/کشور/زبان/برچسب پیشنهاد می‌دهد (پیشنهاد است و با تأیید شما اعمال می‌شود).',
      },
    ],
    steps: [
      'دکمه «میکرورسانه جدید» را بزنید و اطلاعات هویتی + هاب را وارد کنید',
      'وارد صفحه میکرورسانه شوید و در تب سکوها حساب‌های پلتفرمی را متصل کنید',
      'با دکمه «بروزرسانی عملکرد» داده‌ی عملکردی را به‌روز کنید',
      'در تب امتیاز و تعاملات، ارزیابی و سابقه ارتباط را ثبت کنید',
    ],
  },
  {
    id: 'hubs',
    title: 'هاب‌ها',
    icon: 'solar:folder-bold-duotone',
    color: 'secondary',
    content: `هاب واحد سازمانی/مدیریتی سامانه است. میکرورسانه‌ها زیر هاب‌ها گروه‌بندی می‌شوند و نقش‌ها، دسترسی‌ها و داشبوردها حول هاب تعریف می‌شوند. (هاب مستقل از «خوشه موضوعی» و «شبکه روایی» است.)`,
    subsections: [
      {
        title: 'لیست و ساخت هاب',
        desc: 'از صفحه «هاب‌ها» می‌توانید هاب جدید بسازید و هاب‌های موجود را ببینید.',
      },
      {
        title: 'داشبورد هاب',
        desc: 'با کلیک روی هاب، کارت‌های خلاصه (کل/فعال/غیرفعال میکرورسانه، تسک‌های باز/انجام‌شده) + جدول میکرورسانه‌ها + تسک‌های هاب نمایش داده می‌شود.',
      },
      {
        title: 'تخصیص کاربر',
        desc: 'کاربران (مدیر/کارشناس هاب) از طریق رابطه hub_users به هاب نسبت داده می‌شوند و فقط داده‌ی هاب خودشان را می‌بینند.',
      },
    ],
    settings: 'برای افزودن میکرورسانه به یک هاب، هنگام ساخت یا ویرایش میکرورسانه، هاب را انتخاب کنید.',
  },
  {
    id: 'interactions',
    title: 'تعاملات',
    icon: 'solar:chat-round-dots-bold-duotone',
    color: 'success',
    content: `تعاملات «لایه CRM» سامانه‌اند: ثبت هر ارتباط انسانی با یک میکرورسانه (تماس، جلسه، پیام، خدمت، پیگیری).`,
    howItWorks: 'یک میکرورسانه زمانی «فعال» محسوب می‌شود که حداقل یک تعامل با تاریخ در ۶ ماه اخیر داشته باشد. به همین دلیل ثبت منظم تعاملات، شاخص‌های فعال/غیرفعال داشبورد را دقیق نگه می‌دارد.',
    example: {
      scenario: 'با مدیر یک کانال تلگرامی تماس می‌گیرید و درباره همکاری در یک عملیات صحبت می‌کنید',
      result: 'تعامل از نوع «تماس» با خلاصه گفتگو ثبت می‌شود و در تاریخچه میکرورسانه و صفحه تعاملات دیده می‌شود',
      action: 'میکرورسانه تا ۶ ماه «فعال» می‌ماند و از فهرست «بدون تعامل» داشبورد خارج می‌شود',
    },
  },
  {
    id: 'media-score',
    title: 'امتیازدهی رسانه',
    icon: 'solar:star-shine-bold-duotone',
    color: 'warning',
    content: `سیستم امتیازدهی انسانی برای ارزیابی دوره‌ای میکرورسانه‌ها بر اساس ۷ شاخص استاندارد.`,
    subsections: [
      { title: 'وضعیت در نظام مصرف', desc: 'جایگاه رسانه در زنجیره مصرف محتوا (۰ تا ۱۰۰).' },
      { title: 'تعداد بازیگر فعال', desc: 'میزان کنشگران فعال مرتبط با رسانه.' },
      { title: 'کمربستگی', desc: 'سطح انسجام و پیوستگی رسانه.' },
      { title: 'وابستگی', desc: 'میزان وابستگی به منابع/بازیگران بیرونی.' },
      { title: 'نوع تعامل و همکاری', desc: 'کیفیت و نوع همکاری رسانه.' },
      { title: 'توان تولید شاخص', desc: 'ظرفیت رسانه برای تولید محتوای شاخص.' },
      { title: 'درآمد', desc: 'سطح درآمد/پایداری اقتصادی رسانه.' },
    ],
    settings: 'صفحه «امتیازدهی رسانه» مخصوص مدیریت شاخص‌ها (فعال/غیرفعال، بازه، وزن) و در اختیار super_admin است. ثبت امتیاز هر رسانه از تب «امتیاز رسانه» در صفحه همان میکرورسانه انجام می‌شود. برای هر (رسانه، شاخص، دوره) فقط یک امتیاز معتبر ثبت می‌شود و مقدار باید در بازه شاخص باشد.',
  },
  {
    id: 'operations',
    title: 'عملیات‌ها',
    icon: 'solar:posts-carousel-vertical-bold-duotone',
    color: 'info',
    content: `عملیات (Campaign) یک فعالیت هدفمند است که چند میکرورسانه را برای رسیدن به یک هدف مشخص هماهنگ می‌کند و اثر آن سنجیده می‌شود.`,
    subsections: [
      {
        title: 'تب خلاصه',
        desc: 'هدف، وضعیت (پیش‌نویس/فعال/تکمیل/لغو) و توضیح عملیات.',
      },
      {
        title: 'تب رسانه‌ها',
        desc: 'انتخاب و افزودن میکرورسانه‌های مشارکت‌کننده در عملیات.',
      },
      {
        title: 'تب خروجی‌ها',
        desc: 'ثبت خروجی‌های تولیدشده (لینک پست/استوری/ویدیو و...) همراه با آمار بازدید.',
      },
      {
        title: 'تب اثرسنجی',
        desc: 'کارت‌های تجمیعی: رسانه‌های انتخاب‌شده، تسک‌های تخصیص/انجام‌شده، خروجی منتشرشده، مجموع بازدید و تعامل + فهرست رسانه‌های بدون خروجی.',
      },
    ],
    steps: [
      'از صفحه «عملیات‌ها» یک عملیات جدید با هدف بسازید',
      'در تب رسانه‌ها، میکرورسانه‌های مشارکت‌کننده را اضافه کنید',
      'برای هر عملیات تسک تعریف کنید و به کارشناسان بسپارید',
      'خروجی‌ها را ثبت کنید و در تب اثرسنجی نتیجه را ببینید',
    ],
  },
  {
    id: 'tasks',
    title: 'تسک‌ها',
    icon: 'solar:checklist-minimalistic-bold-duotone',
    color: 'primary',
    content: `تسک‌ها واحد کار انسانی و ساده‌اند و می‌توانند به یک هاب، میکرورسانه، خوشه یا عملیات نسبت داده شوند.`,
    subsections: [
      {
        title: 'وضعیت‌ها',
        desc: 'باز → در حال انجام → انجام‌شده → لغوشده.',
      },
      {
        title: 'اولویت',
        desc: 'کم / عادی / زیاد / فوری.',
      },
      {
        title: 'دامنه (Scope)',
        desc: 'هر تسک باید حداقل به یکی از موارد (هاب/میکرورسانه/خوشه/عملیات) متصل باشد؛ در غیر این صورت خطای INVALID_TASK_SCOPE صادر می‌شود.',
      },
      {
        title: 'برچسب‌ها',
        desc: 'تسک‌ها با برچسب‌هایی مثل عملیات، تحلیل، ارتباط‌گیری، منتورینگ، شناسایی، پیگیری، محتوا و خدمت دسته‌بندی می‌شوند.',
      },
    ],
  },
  {
    id: 'content-monitoring',
    title: 'پایش محتوا (موتور Social Monitor)',
    icon: 'solar:gallery-bold-duotone',
    color: 'secondary',
    content: `قابلیت‌های موتور پایش قدیمی زیر بخش «پایش محتوا» در منو حفظ شده‌اند و داده‌ی خام و تحلیلی را برای میکرورسانه‌ها فراهم می‌کنند. پلتفرم دیگر یک «فضای جداگانه» نیست، بلکه یک فیلتر روی حساب‌هاست.`,
    subsections: [
      {
        title: 'منابع (پیج‌ها)',
        desc: 'مدیریت حساب‌های پلتفرمی، افزودن تکی یا ایمپورت اکسل، و دکمه «بارگیری» برای دریافت پست و پروفایل از شبکه اجتماعی.',
      },
      {
        title: 'محتوای جمع‌آوری‌شده',
        desc: 'فید پست‌ها با فیلتر لحن/نوع/وایرال/پلتفرم/کشور/بازه + پردازش هوشمند تکی و توضیح دستی.',
      },
      {
        title: 'تحلیل محتوا',
        desc: 'تحلیل کلان محتوای جمع‌آوری‌شده توسط موتور هوش مصنوعی.',
      },
      {
        title: 'هشدارها',
        desc: 'هشدارها و فرصت‌های محتوایی (تولید با AI یا ثبت دستی).',
      },
      {
        title: 'مرکز بروزرسانی',
        desc: 'اجرای دسته‌ای بارگیری و پردازش (Job Center).',
      },
    ],
  },
  {
    id: 'roles',
    title: 'نقش‌ها و دسترسی',
    icon: 'solar:shield-keyhole-bold-duotone',
    color: 'error',
    content: `سامانه ۵ نقش دارد و دسترسی هر کاربر بر اساس هاب‌هایی که به او نسبت داده شده محدود می‌شود (Hub Scoping).`,
    subsections: [
      { title: 'super_admin', desc: 'دسترسی کامل: مدیریت کاربر/هاب/شاخص و تأیید تسک‌ها.' },
      { title: 'operations_manager', desc: 'دید روی همه رسانه‌ها برای ساخت عملیات، تعریف تسک و اثرسنجی.' },
      { title: 'hub_manager', desc: 'فقط هاب‌های خودش: مدیریت رسانه‌ها، تخصیص تسک و داشبورد هاب.' },
      { title: 'hub_expert', desc: 'فقط هاب‌های خودش: ثبت امتیاز/تعامل و پیگیری تسک‌های خود.' },
      { title: 'viewer', desc: 'فقط‌خواندنی با دامنه محدود.' },
    ],
    howItWorks: 'کاربران hub_manager و hub_expert هیچ رکوردی خارج از هاب‌های خود نمی‌بینند (جداسازی scope در لایه سرویس). نقش admin قدیمی به‌صورت رفتاری معادل super_admin است. کنترل دسترسی با یک flag محیطی (AUTH_ENFORCE) فعال می‌شود و فقط مسیرهای محصول جدید را مشمول می‌کند.',
  },
  {
    id: 'settings',
    title: 'تنظیمات',
    icon: 'solar:settings-bold-duotone',
    color: 'warning',
    content: `تنظیمات سامانه (زیر بخش «سیستم») شامل پیکربندی موتور پایش و هوش مصنوعی است:`,
    subsections: [
      {
        title: 'توکن‌ها و سرویس‌های خارجی',
        desc: 'کلید API اینستاگرام (RapidAPI)، کلید OpenRouter (برای LLM)، مدل LLM، کلید Soniox (رونوشت صوتی).',
      },
      {
        title: 'روایت و تحلیل محتوا',
        desc: 'کلمات کلیدی روایت مطلوب برای تحلیل محتوای جمع‌آوری‌شده.',
      },
      {
        title: 'پرامپت‌های هوش مصنوعی',
        desc: 'پرامپت سیستمی و دستورات اضافی برای ماژول‌های تحلیل، گزارش و هشدار.',
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
      '۱. هاب‌های سازمانی را بسازید و کاربران را به آن‌ها نسبت دهید',
      '۲. میکرورسانه‌ها را ثبت و به هاب‌ها نسبت دهید',
      '۳. حساب‌های پلتفرمی هر میکرورسانه را متصل و عملکرد را بروزرسانی کنید',
      '۴. امتیاز دوره‌ای و تعاملات هر میکرورسانه را ثبت کنید',
      '۵. عملیات تعریف کنید، رسانه‌ها را انتخاب و تسک‌ها را تخصیص دهید',
      '۶. خروجی‌های عملیات را ثبت و اثرسنجی را دنبال کنید',
      '۷. در داشبورد کلان وضعیت کل (پوشش هاب، رسانه‌های بدون تعامل/امتیاز) را پایش کنید',
      '۸. در صورت نیاز به داده محتوایی، از بخش «پایش محتوا» بارگیری و تحلیل کنید',
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
          <Typography variant="body2" color="text.secondary">آشنایی با ماژول‌ها و نحوه کار با سامانه مدیریت و تحلیل میکرورسانه‌ها</Typography>
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
