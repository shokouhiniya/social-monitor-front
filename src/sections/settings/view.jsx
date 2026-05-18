'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { PageInfoBox } from '../dashboard/components/page-info-box';

// ----------------------------------------------------------------------

const PAGE_INFO = {
  title: 'تنظیمات سامانه',
  icon: 'solar:settings-bold-duotone',
  color: 'warning',
  shortDescription: 'مدیریت کلیدهای API، تنظیم روایت و رادار، ادیت پرامپت‌های هوش مصنوعی — هر پرامپت بعد از ذخیره فوراً اعمال می‌شود',
  modules: [
    { name: 'کلیدهای API', icon: 'solar:key-bold-duotone', color: 'error', description: 'سه کلید: RapidAPI (اینستاگرام)، OpenRouter (هوش مصنوعی)، Soniox (رونوشت صوتی). اگر فیلد را خالی بگذارید، از فایل .env خوانده می‌شود.' },
    { name: 'مدل‌های LLM', icon: 'solar:cpu-bolt-bold-duotone', color: 'primary', description: 'دو مدل قابل تنظیم: مدل اصلی (تحلیل پیج، گزارش، هشدار) و مدل سریع (OCR و خلاصه). برای کاهش هزینه می‌توانید مدل‌های ارزان‌تر انتخاب کنید.' },
    { name: 'روایت و رادار', icon: 'solar:target-bold-duotone', color: 'success', description: 'کلمات کلیدی روایت مطلوب (برای شاخص هم‌راستایی)، موضوعات پیش‌فرض رادار سکوت، و معیارهای شاخص همسویی.' },
    { name: 'پرامپت‌های هوش مصنوعی', icon: 'solar:cpu-bolt-bold-duotone', color: 'warning', description: '۷ ماژول قابل ادیت: تحلیل پیج، پنل ۳۶۰°، تولید گزارش، تولید هشدار، تحلیل تک پست، خلاصه روزانه، OCR. هر کدام پرامپت سیستمی + دستورات اضافی دارد.' },
  ],
  tips: [
    'بعد از ذخیره، تغییرات بلافاصله در درخواست‌های بعدی اعمال می‌شود',
    'پرامپت‌هایی که متغیر دارند ({POST_CONTENT}، {TOPICS}، …) را حفظ کنید — این متغیرها با داده زنده جایگزین می‌شوند',
    'برای تنظیمات کوچک، به جای دستکاری پرامپت اصلی، از فیلد «دستورات اضافی» استفاده کنید',
  ],
};

const TABS = [
  { value: 'tokens', label: 'کلیدهای API', icon: 'solar:key-bold-duotone', color: 'error' },
  { value: 'narrative', label: 'روایت و رادار', icon: 'solar:target-bold-duotone', color: 'success' },
  { value: 'prompts', label: 'پرامپت‌های هوش مصنوعی', icon: 'solar:cpu-bolt-bold-duotone', color: 'warning' },
];

// API key cards — each with full guide
const TOKEN_CARDS = [
  {
    key: 'rapidapi_key',
    title: 'کلید RapidAPI (اینستاگرام)',
    icon: 'mdi:instagram',
    color: '#E1306C',
    isSecret: true,
    purpose: 'برای واکشی پروفایل، پست‌ها، استوری‌ها و فالوورهای اینستاگرام',
    howToGet: 'در سایت rapidapi.com حساب بسازید و سپس به Instagram120 API بروید و آن را Subscribe کنید. کلید را از تب «Endpoints» بالای صفحه کپی کنید.',
    url: 'https://rapidapi.com/maatootz/api/instagram120',
    consequenceIfMissing: 'بدون این کلید نمی‌توانید پیج‌های اینستاگرامی را بارگیری کنید. دکمه «بارگیری» با خطای 401 مواجه خواهد شد.',
  },
  {
    key: 'openrouter_key',
    title: 'کلید OpenRouter (هوش مصنوعی)',
    icon: 'solar:cpu-bolt-bold-duotone',
    color: '#7C3AED',
    isSecret: true,
    purpose: 'برای دسترسی به مدل‌های زبانی (GPT, Gemini, Claude و …) جهت تحلیل پیج‌ها، تولید گزارش و هشدار',
    howToGet: 'به openrouter.ai بروید، حساب بسازید، در منوی «Keys» یک کلید جدید بسازید. سپس باید مقداری اعتبار شارژ کنید (هر تحلیل پیج حدود ۰.۰۲ دلار است).',
    url: 'https://openrouter.ai/keys',
    consequenceIfMissing: 'بدون این کلید، دکمه‌های «پردازش هوشمند»، «تولید گزارش با AI» و «تولید هشدار با AI» کار نمی‌کنند.',
  },
  {
    key: 'soniox_key',
    title: 'کلید Soniox (رونوشت صوتی)',
    icon: 'solar:microphone-bold-duotone',
    color: '#0EA5E9',
    isSecret: true,
    purpose: 'برای استخراج متن از صوت ویدیوها، ریل‌ها و استوری‌ها',
    howToGet: 'به console.soniox.com بروید، حساب بسازید و در بخش API Keys یک کلید بسازید. هر دقیقه ویدیو حدود ۰.۰۰۶ دلار هزینه دارد.',
    url: 'https://console.soniox.com',
    consequenceIfMissing: 'بدون این کلید، فقط متن کپشن پست‌ها تحلیل می‌شود. صوت ویدیوها نادیده گرفته می‌شود.',
    optional: true,
  },
];

const MODEL_CARDS = [
  {
    key: 'llm_model',
    title: 'مدل LLM اصلی',
    icon: 'solar:cpu-bolt-bold-duotone',
    color: 'primary',
    purpose: 'برای کارهای سنگین: تحلیل پیج (شاخص‌ها و رادار شخصیت)، تولید گزارش دوره‌ای، تولید هشدار استراتژیک، توصیف ۳۶۰°',
    suggestions: [
      { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: 'دقیق‌ترین، گران‌تر — پیشنهادی' },
      { value: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash', desc: 'سریع، ارزان — مناسب تست' },
      { value: 'openai/gpt-4o', label: 'GPT-4o', desc: 'کیفیت بالا، گران' },
      { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', desc: 'تحلیلی، گران' },
    ],
  },
  {
    key: 'llm_model_fast',
    title: 'مدل LLM سریع (OCR و خلاصه)',
    icon: 'solar:bolt-circle-bold-duotone',
    color: 'info',
    purpose: 'برای کارهای سبک: استخراج متن از تصویر (OCR) و تولید خلاصه یک‌جمله‌ای داشبورد',
    suggestions: [
      { value: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash', desc: 'سریع و ارزان — پیشنهادی' },
      { value: 'google/gemini-1.5-flash', label: 'Gemini 1.5 Flash', desc: 'پایدار، ارزان' },
    ],
  },
];

// Narrative + radar with examples
const NARRATIVE_CARDS = [
  {
    key: 'target_narrative',
    title: 'کلمات کلیدی روایت مطلوب',
    icon: 'solar:target-bold-duotone',
    color: 'success',
    purpose: '«شاخص هم‌راستایی هفته» در داشبورد بر اساس این کلمات محاسبه می‌شود. سامانه کلمات کلیدی پست‌های ۷ روز اخیر را استخراج می‌کند و نسبت آن‌ها را با این لیست مقایسه می‌کند.',
    formula: '(تعداد کلمات روایت در پست‌ها) ÷ (کل کلمات کلیدی هفته) × ۱۰۰',
    example: 'مقاومت,فلسطین,غزه,حقوق بشر,عدالت',
    interpretation: [
      { range: 'بالای ۷۰٪', meaning: '✅ شبکه کاملاً هم‌راستا با روایت' },
      { range: '۴۰٪ تا ۷۰٪', meaning: '⚠️ هم‌راستایی متوسط — نیاز به تقویت' },
      { range: 'زیر ۴۰٪', meaning: '🔴 شبکه از روایت اصلی فاصله گرفته' },
    ],
    tip: 'کلمات را با کاما جدا کنید. سعی کنید ۵ تا ۱۰ کلمه کلیدی اصلی را وارد کنید (نه کلمات عمومی).',
    rows: 2,
  },
  {
    key: 'silence_radar_topics',
    title: 'موضوعات پیش‌فرض رادار سکوت',
    icon: 'solar:eye-bold-duotone',
    color: 'error',
    purpose: '«رادار سکوت» نشان می‌دهد شبکه شما درباره چه موضوعاتی پوشش داده و درباره چه موضوعاتی سکوت کرده. این لیست به عنوان مقدار پیش‌فرض رادار استفاده می‌شود.',
    formula: 'برای هر موضوع: تعداد پست‌هایی که این موضوع را پوشش داده‌اند → اگر ۰ بود، «سکوت» محسوب می‌شود',
    example: 'غزه,اقتصاد غزه,انتخابات آمریکا,تغییرات اقلیمی,هوش مصنوعی,بحران یمن,حقوق بشر,تحریم‌ها,مهاجرت',
    interpretation: [
      { range: 'پوشش کامل (سبز)', meaning: 'موضوع در پست‌های شبکه آمده' },
      { range: 'پوشش جزئی (نارنجی)', meaning: 'موضوع کم پوشش داده شده' },
      { range: 'سکوت (قرمز)', meaning: '🔴 شبکه درباره این موضوع چیزی نگفته — فرصت تولید محتوا' },
    ],
    tip: 'موضوعات داغ جهانی یا ملی را وارد کنید. سامانه به صورت خودکار هر چند روز یکبار رادار را بازخوانی می‌کند.',
    rows: 2,
  },
  {
    key: 'alignment_criteria',
    title: 'معیارهای شاخص همسویی',
    icon: 'solar:flag-bold-duotone',
    color: 'warning',
    purpose: '«شاخص همسویی» (alignment_score) برای هر پیج توسط هوش مصنوعی محاسبه می‌شود. این شاخص نشان می‌دهد پیج چقدر با «محور» مدنظر شما هم‌راستاست. می‌توانید معیارها را مطابق نیاز خود ادیت کنید.',
    formula: 'AI متن پست‌های پیج را بر اساس این معیارها امتیاز می‌دهد: ۰=کاملاً ضد، ۵=خنثی، ۱۰=کاملاً هم‌راستا',
    example: 'مخالفت با آمریکا و اسرائیل\nحمایت از مسئله فلسطین\nحمایت از لبنان و حزب‌الله',
    interpretation: [
      { range: '۸ تا ۱۰', meaning: '✅ کاملاً هم‌راستا' },
      { range: '۴ تا ۷', meaning: '⚪ خنثی یا بی‌طرف' },
      { range: '۰ تا ۳', meaning: '🔴 ضد محور' },
    ],
    tip: 'هر خط یک معیار. می‌توانید معیارها را اضافه/حذف یا اولویت بدهید. این معیارها در پرامپت تحلیل پیج به AI پاس می‌شوند.',
    rows: 7,
  },
];

// Prompt modules with realistic outputs
const PROMPT_MODULES = [
  {
    key: 'prompt_page_analysis',
    extraKey: 'prompt_page_analysis_extra',
    extraTemplate: `## دستورات تکمیلی اختصاصی تحلیل صفحه

این بخش باید همراه با پرامپت اصلی تحلیل صفحه اجرا شود و نباید ساختار خروجی اصلی را تغییر دهد.

قواعد زیر را در تحلیل رعایت کن:

1. تحلیل صفحه باید برای تصمیم‌گیری عملیاتی قابل استفاده باشد، نه فقط توصیف محتوایی.
2. اگر صفحه از نظر تعامل عملیاتی مناسب است، در affinity_score این موضوع را منعکس کن؛ اما اگر صفحه فقط از نظر محتوایی همسو است ولی ریسک تعامل دارد، affinity_score را بیش از حد بالا نده.
3. اگر صفحه پرنفوذ است اما اعتبار یا پایداری پایینی دارد، influence_score می‌تواند بالا باشد ولی credibility_score و consistency_rate باید مستقل و دقیق امتیازدهی شوند.
4. در تحلیل demographic مثل religion، gender، age_range و nationality محافظه‌کار باش. فقط در صورت وجود شواهد روشن مقدار بده. در غیر این صورت "unknown" برگردان.
5. اگر داده‌های پست‌ها کم، ناقص، قدیمی یا تکراری هستند، امتیازهای تحلیلی را با احتیاط بده و از قطعیت بالا پرهیز کن.
6. در keywords از کلمات عمومی و کم‌ارزش پرهیز کن. کلمات باید نشان‌دهنده محورهای واقعی محتوایی یا روایی صفحه باشند.
7. pain_points باید از دل محتوا و دغدغه‌های تکرارشونده استخراج شود، نه از حدس روان‌شناختی درباره صاحب صفحه یا مخاطبان.
8. تحلیل sentiment هر پست باید نسبت به لحن و محتوای همان پست باشد، نه نسبت به دیدگاه شخصی یا ارزش‌گذاری بیرونی.
9. اگر caption، OCR و transcription با هم تعارض دارند، تحلیل را بر اساس مجموع شواهد انجام بده و از نتیجه‌گیری قطعی خودداری کن.
10. اگر هیچ نشانه کافی برای دسته‌بندی یا خوشه‌بندی وجود ندارد، مقدار "unknown" یا null بده. خروجی را با حدس پر نکن.

ساختار خروجی را به هیچ عنوان تغییر نده. هیچ فیلد جدیدی اضافه نکن. هیچ فیلدی را حذف نکن.`,
    title: 'ماژول تحلیل پیج',
    icon: 'solar:user-id-bold-duotone',
    color: 'primary',
    when: 'وقتی روی یک پیج دکمه «پردازش هوشمند» را می‌زنید',
    purpose: 'این ماژول اطلاعات پروفایل و آخرین پست‌های یک پیج را به هوش مصنوعی می‌دهد تا تحلیل عمیق ارائه کند.',
    inputs: ['نام، یوزرنیم، بیو پیج', 'فالوور، فالووینگ، تعداد پست', 'کپشن آخرین پست‌ها', 'رونوشت صوتی ویدیوها', 'متن استخراج‌شده از تصاویر (OCR)'],
    outputs: [
      { label: 'دسته‌بندی موضوعی', desc: 'یکی از ۲۵ خوشه: news, activism, lifestyle, …' },
      { label: 'دسته‌بندی هویتی', desc: 'یکی از ۱۵ کیستی: blogger, news_outlet, journalist, …' },
      { label: 'اعتبار (۰-۱۰)', desc: 'واقعی بودن، کیفیت مخاطب، اعتبار اجتماعی' },
      { label: 'نفوذ (۰-۱۰)', desc: 'قدرت تأثیر، Reach، توان تحریک اقدام' },
      { label: 'پایداری (۰-۱۰)', desc: 'استمرار انتشار، ثبات تعامل، رشد ارگانیک' },
      { label: 'همراهی (۰-۱۰)', desc: 'وفاداری مخاطب، احساس تعلق' },
      { label: 'همسویی (۰-۱۰)', desc: 'هم‌جهتی با محور مقاومت' },
      { label: 'رادار شخصیت ۶ محور', desc: 'تهاجمی/دفاعی، تولیدکننده/بازنشردهنده، …' },
      { label: 'دغدغه‌ها', desc: 'لیست ۳ دغدغه اصلی پیج' },
      { label: 'کلمات کلیدی', desc: '۵ کلمه کلیدی محتوایی' },
      { label: 'تحلیل هر پست', desc: 'لحن، موضوعات و کلمات کلیدی هر پست' },
    ],
  },
  {
    key: 'prompt_page_narrative',
    extraKey: 'prompt_page_narrative_extra',
    extraTemplate: `## دستورات تکمیلی اختصاصی پنل ۳۶۰ درجه بصیرت

این بخش باید همراه با پرامپت اصلی narrative اجرا شود و نباید ساختار خروجی را تغییر دهد.

قواعد زیر را رعایت کن:

1. narrative_description باید فراتر از معرفی صفحه باشد. متن باید نقش رسانه‌ای صفحه، محورهای محتوایی، سبک روایت و جایگاه احتمالی آن در شبکه را توضیح دهد.
2. متن narrative_description باید برای مدیر یا تحلیل‌گر ارشد قابل استفاده باشد، نه صرفاً برای کاربر عمومی.
3. از اغراق پرهیز کن. اگر صفحه واقعاً اثرگذار، پرنفوذ یا راهبردی نیست، آن را بزرگ‌تر از داده‌ها نشان نده.
4. topic_distribution باید از محتوای واقعی ۳۰ پست انتهایی استخراج شود. اگر داده ناقص است، درصدها را محافظه‌کارانه بده.
5. audience_description نباید شامل ادعاهای قطعی درباره سن، جنسیت، دین، ملیت یا طبقه اجتماعی مخاطب باشد، مگر اینکه داده مستقیم وجود داشته باشد.
6. engagement_suggestion باید عملیاتی باشد. حتماً مشخص کن تعامل بهتر است مستقیم، غیرمستقیم، محتوایی، رصدی، همکاری‌محور یا محدود باشد.
7. اگر تعامل با صفحه ریسک دارد، آن را پنهان نکن. پیشنهاد بده تعامل با چه احتیاطی انجام شود.
8. اگر صفحه برای تعامل مناسب نیست، صریح بنویس که رویکرد مناسب‌تر «رصد»، «تعامل غیرمستقیم» یا «عدم ورود فعال» است.
9. ترجمه‌های engagement_suggestion باید معنایی، طبیعی و حرفه‌ای باشند؛ نه تحت‌اللفظی و خشک.
10. ساختار خروجی را تغییر نده و هیچ فیلد جدیدی اضافه نکن.`,
    title: 'ماژول پنل ۳۶۰° بصیرت',
    icon: 'solar:gallery-circle-bold-duotone',
    color: 'secondary',
    when: 'وقتی در پروفایل پیج روی دکمه «تولید پنل ۳۶۰°» می‌زنید',
    purpose: 'این ماژول یک «شناسنامه روایی» جامع از پیج می‌سازد که شامل توصیف، توزیع موضوعی، توصیف مخاطب و پیشنهاد تعامل چندزبانه است.',
    inputs: ['متادیتا کامل پیج', 'شخصیت رادار', 'دغدغه‌ها و کلمات کلیدی', 'کپشن/رونوشت ۳۰ پست انتهایی'],
    outputs: [
      { label: 'توصیف روایی', desc: 'متن ۲۰۰-۳۰۰ کلمه‌ای — علایق، سبک روایی، دیدگاه سیاسی' },
      { label: 'توزیع موضوعی', desc: 'آرایه ۴-۸ موضوع با درصد (مثلاً: اقتصاد ۴۵٪، اخبار ۲۰٪)' },
      { label: 'توصیف مخاطب', desc: 'پاراگراف ۸۰-۱۲۰ کلمه‌ای — جنسیت، سن، گرایش' },
      { label: 'پیشنهاد تعامل', desc: 'پاراگراف ۸۰-۱۲۰ کلمه‌ای — نحوه نزدیک شدن به ادمین پیج' },
      { label: 'ترجمه پیشنهاد به ۵ زبان', desc: 'انگلیسی، عربی، اسپانیولی، ترکی، اردو' },
    ],
  },
  {
    key: 'prompt_report_generation',
    extraKey: 'prompt_report_generation_extra',
    extraTemplate: `## دستورات تکمیلی اختصاصی گزارش تحلیلی

این بخش باید همراه با پرامپت اصلی تولید گزارش اجرا شود و نباید ساختار خروجی را تغییر دهد.

قواعد زیر را رعایت کن:

1. گزارش باید برای مدیر قابل استفاده باشد، نه صرفاً خلاصه آماری.
2. در report، فقط topics و keywords را لیست نکن. توضیح بده این داده‌ها چه تصویری از وضعیت شبکه می‌سازند.
3. اگر داده مقایسه‌ای با دوره قبل وجود ندارد، از ادعاهای روندی مثل «افزایش یافته»، «کاهش یافته»، «رشد کرده» یا «افت کرده» استفاده نکن.
4. mood را با احتیاط انتخاب کن. اگر داده‌ها مبهم یا خنثی هستند، مقدار "در وضعیت انتظار" مناسب‌تر است.
5. از بحران‌سازی و اغراق پرهیز کن. کلماتی مثل «بحران»، «التهاب شدید» یا «ریسک جدی» فقط با شواهد کافی استفاده شوند.
6. headline باید کوتاه، دقیق و مدیریتی باشد. از تیترهای شعاری و کلی پرهیز کن.
7. report باید حداقل ۵ پاراگراف داشته باشد و متن آن پیوسته و خوانا باشد.
8. top_topics و top_keywords را با حدس پر نکن. فقط از داده‌های ورودی یا نسخه تمیزشده همان داده‌ها استفاده کن.
9. اگر داده‌ها محدود هستند، این محدودیت را در متن report به شکل حرفه‌ای و کوتاه بیان کن.
10. ساختار خروجی را تغییر نده و هیچ فیلد جدیدی اضافه نکن.`,
    title: 'ماژول تولید گزارش دوره‌ای',
    icon: 'solar:document-text-bold-duotone',
    color: 'info',
    when: 'وقتی در داشبورد روی «تولید با AI» در کارت گزارش دوره‌ای می‌زنید',
    purpose: 'این ماژول آمار جمعی شبکه (پیج‌ها، موضوعات، کلمات کلیدی، احساسات) را تحلیل و یک گزارش متنی جامع تولید می‌کند که در داشبورد نمایش داده می‌شود.',
    inputs: ['آمار پست‌های بازه زمانی انتخابی', 'موضوعات داغ شبکه', 'کلمات کلیدی پرتکرار', 'تحلیل احساسات', 'پیج‌های پرنفوذ', 'پیج‌های Ghost (کم‌فعالیت)'],
    outputs: [
      { label: 'تیتر شبکه', desc: 'یک جمله کوتاه و گویا (مثلاً: «شبکه ۴۸ ساعته با تمرکز روی غزه فعال بوده»)' },
      { label: 'گزارش مفصل', desc: '۵ پاراگراف: وضعیت کلی، موضوعات داغ، تحلیل احساسات، عملکرد پیج‌ها، پیشنهادات' },
      { label: 'حال‌وهوای شبکه', desc: 'امیدوار / ملتهب / در وضعیت انتظار' },
      { label: 'موضوعات برتر', desc: '۳ موضوع داغ' },
      { label: 'کلمات کلیدی برتر', desc: '۳ کلمه پرتکرار' },
    ],
  },
  {
    key: 'prompt_alert_generation',
    extraKey: 'prompt_alert_generation_extra',
    extraTemplate: `## دستورات تکمیلی اختصاصی تولید هشدار استراتژیک

این بخش باید همراه با پرامپت اصلی تولید هشدار اجرا شود و نباید ساختار خروجی را تغییر دهد.

قواعد زیر را رعایت کن:

1. هشدار ساختگی تولید نکن. اگر داده‌ها هشدار قابل دفاع نشان نمی‌دهند، آرایه خالی یا تعداد کمتری هشدار تولید کن.
2. هشدارها باید از مهم‌ترین به کم‌اهمیت‌ترین مرتب شوند.
3. priority را بیش از حد بالا نبر. critical فقط برای موارد بسیار جدی و فوری استفاده شود.
4. category = crisis را فقط وقتی انتخاب کن که نشانه‌های روشن از ریسک جدی، التهاب، حمله روایتی یا آسیب اعتباری وجود دارد.
5. category = opportunity فقط وقتی انتخاب شود که واقعاً فرصت اقدام عملیاتی وجود دارد، نه صرفاً اینکه یک موضوع مثبت دیده شده است.
6. message هر هشدار باید دلیل اهمیت آن را توضیح دهد، نه اینکه فقط یک جمله کلی درباره موضوع بنویسد.
7. playbook باید دقیقاً شامل ۳ اقدام عملیاتی باشد.
8. اقدام‌های playbook باید قابل اجرا توسط تیم رسانه‌ای یا عملیات باشد. از توصیه‌های کلی مثل «بررسی شود» یا «توجه شود» پرهیز کن.
9. اگر داده‌ها snapshot هستند و داده مقایسه‌ای وجود ندارد، از عبارت‌های روندی مثل «افزایش»، «کاهش»، «رشد ناگهانی» یا «افت» استفاده نکن.
10. هشدارهای تکراری یا بسیار مشابه را با هم ادغام کن.

ساختار خروجی را تغییر نده. هیچ فیلد جدیدی اضافه نکن.`,
    title: 'ماژول تولید هشدار استراتژیک',
    icon: 'solar:danger-triangle-bold-duotone',
    color: 'error',
    when: 'وقتی در داشبورد روی «بروزرسانی» یا در صفحه هشدارها روی «تولید هشدار با AI» می‌زنید',
    purpose: 'این ماژول داده‌های شبکه را تحلیل و ۵ هشدار استراتژیک با اولویت و اقدامات پیشنهادی تولید می‌کند.',
    inputs: ['موضوعات داغ شبکه', 'پیج‌های Ghost', 'موضوعات سکوت', 'تغییرات احساسات', 'پیج‌های پرنفوذ'],
    outputs: [
      { label: 'عنوان هشدار', desc: 'مثلاً: «شکاف پوشش در موضوع اقتصاد غزه»' },
      { label: 'توضیح', desc: '۲ جمله توضیح مفصل و اقدام مورد نیاز' },
      { label: 'اولویت', desc: 'critical / high / medium / low' },
      { label: 'دسته‌بندی', desc: 'silence_gap / trend_shift / crisis / opportunity' },
      { label: 'اقدامات پیشنهادی (Playbook)', desc: 'لیست ۳-۵ اقدام مشخص با مسئول و زمان' },
    ],
  },
  {
    key: 'prompt_post_analysis',
    extraKey: 'prompt_post_analysis_extra',
    title: 'ماژول تحلیل تک پست',
    icon: 'solar:gallery-bold-duotone',
    color: 'success',
    when: 'وقتی در دیالوگ پست روی «پردازش هوشمند پست» می‌زنید',
    purpose: 'این ماژول یک پست را تحلیل می‌کند: لحن آن را تشخیص می‌دهد، موضوعات و کلمات کلیدی استخراج می‌کند، و در صورت نیاز ترجمه فارسی تولید می‌کند.',
    inputs: ['کپشن پست', 'رونوشت صوتی (اگر ویدیو است)', 'متن استخراج‌شده از تصویر', 'توضیح دستی تحلیلگر'],
    outputs: [
      { label: 'sentiment_score', desc: 'عدد ۰ تا ۱-' },
      { label: 'sentiment_label', desc: 'angry / hopeful / neutral / sad' },
      { label: 'caption_fa', desc: 'ترجمه فارسی کپشن (اگر فارسی نیست)' },
      { label: 'transcription_fa', desc: 'ترجمه فارسی رونوشت' },
      { label: 'ocr_text_fa', desc: 'ترجمه فارسی متن تصویر' },
      { label: 'topics', desc: 'لیست موضوعات اصلی پست' },
      { label: 'keywords', desc: 'لیست ۳-۵ کلمه کلیدی' },
    ],
    note: 'متغیر {POST_CONTENT} با محتوای پست (کپشن + رونوشت + OCR + توضیح) جایگزین می‌شود. حتماً این متغیر را در پرامپت نگه دارید.',
  },
  {
    key: 'prompt_ai_synthesizer',
    extraKey: 'prompt_ai_synthesizer_extra',
    extraTemplate: `## دستورات تکمیلی اختصاصی خلاصه‌ساز AI

این بخش باید همراه با پرامپت اصلی خلاصه‌ساز اجرا شود.

قواعد زیر را رعایت کن:

1. خروجی فقط یک جمله فارسی باشد.
2. جمله نباید بیشتر از ۳۰ کلمه باشد.
3. جمله باید مدیریتی، دقیق و قابل نمایش در داشبورد باشد.
4. از لحن شعاری، تبلیغاتی، احساسی یا بیش از حد دراماتیک پرهیز کن.
5. اگر داده‌ها مبهم یا پراکنده هستند، جمله باید همین ابهام یا پراکندگی را نشان دهد.
6. اگر mood ملتهب است، از بحران‌سازی بی‌پایه پرهیز کن و فقط به ریسک یا نیاز به رصد اشاره کن.
7. اگر mood امیدوار است، از خوش‌بینی اغراق‌آمیز پرهیز کن و فقط به فرصت یا ظرفیت تعامل اشاره کن.
8. اگر sentiment_score با topics و keywords هم‌خوانی ندارد، جمله را محتاطانه بنویس.
9. از جمله‌های کلی مثل «شبکه امروز وضعیت مهمی دارد» استفاده نکن.
10. هیچ توضیح اضافه، JSON، markdown یا علامت نقل‌قول برنگردان.`,
    title: 'ماژول خلاصه روزانه (AI Synthesizer)',
    icon: 'solar:bolt-circle-bold-duotone',
    color: 'warning',
    when: 'به صورت خودکار هر ۵ دقیقه — برای نمایش جمله بالای داشبورد',
    purpose: 'این ماژول یک جمله کوتاه (حداکثر ۳۰ کلمه) تولید می‌کند که خلاصه وضعیت امروز شبکه باشد و در بالای داشبورد به عنوان خلاصه نمایش داده می‌شود.',
    inputs: ['موضوعات داغ ۲۴ ساعت اخیر', 'کلمات کلیدی پرتکرار', 'لحن غالب شبکه (امیدوار/ملتهب/منتظر)', 'امتیاز میانگین احساسات'],
    outputs: [
      { label: 'خلاصه یک‌خطی', desc: 'جمله فارسی حداکثر ۳۰ کلمه — مثلاً: «شبکه در ۲۴ ساعت گذشته متمرکز روی غزه و با لحن ملتهب است»' },
    ],
    note: 'متغیرهای {TOPICS}، {KEYWORDS}، {MOOD} و {SENTIMENT_SCORE} با مقادیر زنده شبکه جایگزین می‌شوند. این متغیرها را در پرامپت نگه دارید.',
  },
  {
    key: 'prompt_ocr',
    extraKey: null,
    title: 'ماژول استخراج متن از تصویر (OCR)',
    icon: 'solar:scanner-bold-duotone',
    color: 'info',
    when: 'هنگام «پردازش هوشمند» پیج یا پست روی پست‌های تصویری',
    purpose: 'این ماژول متن نوشته شده روی عکس‌ها (مثل تیتر، زیرنویس، واترمارک) را استخراج می‌کند. خروجی آن در تحلیل پست به عنوان «متن روی تصویر» استفاده می‌شود.',
    inputs: ['عکس پست (jpg/png/webp)'],
    outputs: [
      { label: 'متن استخراج‌شده', desc: 'تمام متن قابل خواندن از تصویر — یا "NO_TEXT" اگر تصویر متن ندارد' },
    ],
    note: 'این پرامپت معمولاً به انگلیسی نوشته می‌شود چون مدل‌های Vision عملکرد بهتری با دستورات انگلیسی دارند.',
  },
];

// ----------------------------------------------------------------------
// Sub-components

function SecretField({ value, onChange, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      fullWidth
      size="small"
      value={value}
      onChange={onChange}
      type={show ? 'text' : 'password'}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => setShow(!show)}>
              <Iconify icon={show ? 'solar:eye-closed-bold' : 'solar:eye-bold'} width={18} />
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
}

function TokenCard({ card, value, onChange, isChanged }) {
  return (
    <Card sx={(theme) => ({ p: 2.5, border: `1px solid ${alpha(card.color, 0.2)}`, borderRadius: 2, position: 'relative' })}>
      <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(card.color, 0.12), flexShrink: 0 }}>
          <Iconify icon={card.icon} width={24} sx={{ color: card.color }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{card.title}</Typography>
            {card.optional && <Chip label="اختیاری" size="small" variant="outlined" sx={{ height: 18, fontSize: 9 }} />}
            {isChanged && <Chip label="تغییر یافته" size="small" color="warning" sx={{ height: 18, fontSize: 9 }} />}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.7 }}>
            <strong>کاربرد:</strong> {card.purpose}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <SecretField value={value} onChange={onChange} placeholder="کلید را اینجا وارد کنید..." />

        <Box sx={(theme) => ({ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.04), border: `1px dashed ${alpha(theme.palette.info.main, 0.2)}` })}>
          <Stack direction="row" alignItems="flex-start" spacing={1}>
            <Iconify icon="solar:lightbulb-bold-duotone" width={16} sx={{ color: 'info.main', mt: 0.25, flexShrink: 0 }} />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>چطور این کلید را بگیرم؟</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7, display: 'block', mb: 0.5 }}>{card.howToGet}</Typography>
              <Button size="small" component="a" href={card.url} target="_blank" rel="noopener noreferrer"
                startIcon={<Iconify icon="solar:link-bold" width={14} />} sx={{ fontSize: 11, height: 24 }}>
                باز کردن صفحه دریافت کلید
              </Button>
            </Box>
          </Stack>
        </Box>

        <Box sx={(theme) => ({ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.error.main, 0.04), border: `1px dashed ${alpha(theme.palette.error.main, 0.2)}` })}>
          <Stack direction="row" alignItems="flex-start" spacing={1}>
            <Iconify icon="solar:danger-triangle-bold-duotone" width={16} sx={{ color: 'error.main', mt: 0.25, flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              <strong>اگر این کلید نباشد:</strong> {card.consequenceIfMissing}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

function ModelCard({ card, value, onChange, isChanged }) {
  return (
    <Card sx={(theme) => ({ p: 2.5, border: `1px solid ${alpha(theme.palette[card.color].main, 0.2)}`, borderRadius: 2 })}>
      <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
        <Box sx={(theme) => ({ width: 44, height: 44, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette[card.color].main, 0.12), flexShrink: 0 })}>
          <Iconify icon={card.icon} width={24} sx={{ color: `${card.color}.main` }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{card.title}</Typography>
            {isChanged && <Chip label="تغییر یافته" size="small" color="warning" sx={{ height: 18, fontSize: 9 }} />}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>{card.purpose}</Typography>
        </Box>
      </Stack>

      <TextField fullWidth size="small" value={value} onChange={onChange} placeholder="مثال: google/gemini-2.5-pro" sx={{ mb: 1.5, fontFamily: 'monospace' }} />

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>پیشنهادات:</Typography>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {card.suggestions.map((s) => (
          <Chip
            key={s.value}
            label={
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>{s.label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 9 }}>{s.desc}</Typography>
              </Box>
            }
            onClick={() => onChange({ target: { value: s.value } })}
            variant={value === s.value ? 'filled' : 'outlined'}
            color={value === s.value ? card.color : 'default'}
            sx={{ height: 'auto', py: 0.5, '& .MuiChip-label': { px: 1 } }}
          />
        ))}
      </Stack>
    </Card>
  );
}

function NarrativeCard({ card, value, onChange, isChanged }) {
  return (
    <Card sx={(theme) => ({ p: 2.5, border: `1px solid ${alpha(theme.palette[card.color].main, 0.2)}`, borderRadius: 2 })}>
      <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
        <Box sx={(theme) => ({ width: 48, height: 48, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette[card.color].main, 0.12), flexShrink: 0 })}>
          <Iconify icon={card.icon} width={26} sx={{ color: `${card.color}.main` }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{card.title}</Typography>
            {isChanged && <Chip label="تغییر یافته" size="small" color="warning" sx={{ height: 18, fontSize: 9 }} />}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.8 }}>{card.purpose}</Typography>
        </Box>
      </Stack>

      <TextField
        fullWidth
        size="small"
        multiline
        rows={card.rows || 2}
        value={value}
        onChange={onChange}
        placeholder={card.example}
        helperText={card.tip}
        sx={{ mb: 2 }}
      />

      <Stack spacing={1.5}>
        <Box sx={(theme) => ({ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.04), border: `1px solid ${alpha(theme.palette.info.main, 0.15)}` })}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Iconify icon="solar:calculator-minimalistic-bold-duotone" width={16} sx={{ color: 'info.main' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'info.main' }}>فرمول محاسبه</Typography>
          </Stack>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{card.formula}</Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>تفسیر نتایج:</Typography>
          <Stack spacing={0.75}>
            {card.interpretation.map((item, idx) => (
              <Stack key={idx} direction="row" spacing={1} alignItems="center"
                sx={(theme) => ({ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.grey[500], 0.05) })}
              >
                <Chip label={item.range} size="small" variant="outlined" sx={{ minWidth: 110, fontSize: 10 }} />
                <Typography variant="caption">{item.meaning}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box sx={(theme) => ({ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.04) })}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon="solar:lightbulb-bold-duotone" width={14} sx={{ color: 'success.main' }} />
            <Typography variant="caption" color="text.secondary"><strong>مثال:</strong> {card.example}</Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

function PromptCard({ module, settings, changes, onChangeField }) {
  const mainSetting = settings.find((s) => s.key === module.key);
  const extraSetting = module.extraKey ? settings.find((s) => s.key === module.extraKey) : null;
  if (!mainSetting) return null;

  const mainValue = changes[module.key] !== undefined ? changes[module.key] : mainSetting.value;
  const extraValue = module.extraKey
    ? (changes[module.extraKey] !== undefined ? changes[module.extraKey] : (extraSetting?.value || ''))
    : '';
  const isMainChanged = changes[module.key] !== undefined;
  const isExtraChanged = module.extraKey ? changes[module.extraKey] !== undefined : false;

  return (
    <Card sx={(theme) => ({ border: `1px solid ${alpha(theme.palette[module.color].main, 0.2)}`, borderRadius: 2, overflow: 'hidden' })}>
      {/* Header */}
      <Box sx={(theme) => ({ px: 2.5, py: 2, bgcolor: alpha(theme.palette[module.color].main, 0.06), borderBottom: `1px solid ${alpha(theme.palette[module.color].main, 0.1)}` })}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Box sx={(theme) => ({ width: 48, height: 48, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette[module.color].main, 0.12), flexShrink: 0 })}>
            <Iconify icon={module.icon} width={26} sx={{ color: `${module.color}.main` }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.25 }}>{module.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7, display: 'block' }}>{module.purpose}</Typography>
            <Box sx={(theme) => ({ mt: 1, p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.warning.main, 0.06), display: 'inline-block' })}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:bolt-circle-bold" width={14} sx={{ color: 'warning.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.main' }}>کی فعال می‌شود؟</Typography>
                <Typography variant="caption" color="text.secondary">{module.when}</Typography>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {/* Inputs */}
        {module.inputs && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
              <Iconify icon="solar:download-square-bold-duotone" width={14} sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
              ورودی‌های این ماژول:
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {module.inputs.map((inp, idx) => (
                <Chip key={idx} label={inp} size="small" variant="outlined" sx={{ fontSize: 10 }} />
              ))}
            </Stack>
          </Box>
        )}

        {/* Outputs */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
            <Iconify icon="solar:upload-square-bold-duotone" width={14} sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
            خروجی‌های این ماژول:
          </Typography>
          <Box sx={(theme) => ({ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.05), border: `1px dashed ${alpha(theme.palette.grey[500], 0.15)}` })}>
            <Stack spacing={0.75}>
              {module.outputs.map((out, idx) => (
                <Stack key={idx} direction="row" alignItems="flex-start" spacing={1}>
                  <Iconify icon="solar:bookmark-bold" width={12} sx={{ color: `${module.color}.main`, mt: 0.5, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>{out.label}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'inline', fontSize: 11 }}> — {out.desc}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* System Prompt */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Iconify icon="solar:cpu-bolt-bold-duotone" width={16} sx={{ color: 'warning.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>پرامپت سیستمی</Typography>
            {isMainChanged && <Chip label="تغییر یافته" size="small" color="warning" sx={{ height: 18, fontSize: 9 }} />}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', lineHeight: 1.7 }}>
            دستورالعمل اصلی به هوش مصنوعی. تعریف نقش، اهداف و قوانین خروجی. تغییر این متن لحن و کیفیت تحلیل را تغییر می‌دهد.
          </Typography>
          {module.note && (
            <Box sx={(theme) => ({ p: 1, mb: 1, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.06), border: `1px dashed ${alpha(theme.palette.info.main, 0.2)}` })}>
              <Stack direction="row" alignItems="flex-start" spacing={0.75}>
                <Iconify icon="solar:info-circle-bold-duotone" width={14} sx={{ color: 'info.main', mt: 0.25, flexShrink: 0 }} />
                <Typography variant="caption" color="info.dark" sx={{ lineHeight: 1.7 }}>{module.note}</Typography>
              </Stack>
            </Box>
          )}
          <TextField
            fullWidth
            size="small"
            multiline
            rows={10}
            value={mainValue}
            onChange={(e) => onChangeField(module.key, e.target.value)}
            placeholder="پرامپت سیستمی..."
            sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8 } }}
          />
        </Box>

        {/* Extra Instructions — only if extraKey exists */}
        {module.extraKey && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Iconify icon="solar:add-circle-bold-duotone" width={16} sx={{ color: 'success.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>دستورات اضافی <Chip label="اختیاری" size="small" variant="outlined" sx={{ height: 16, fontSize: 9, ml: 0.5 }} /></Typography>
              {isExtraChanged && <Chip label="تغییر یافته" size="small" color="warning" sx={{ height: 18, fontSize: 9 }} />}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', lineHeight: 1.7 }}>
              دستورات تکمیلی که به انتهای پرامپت اصلی اضافه می‌شود. مثلاً: «لحن رسمی‌تر باشد» یا «روی تحلیل احساسات بیشتر تمرکز کن».
            </Typography>
            {module.extraTemplate && !extraValue && (
              <Button
                size="small"
                variant="outlined"
                color="success"
                startIcon={<Iconify icon="solar:document-add-bold" width={16} />}
                onClick={() => onChangeField(module.extraKey, module.extraTemplate)}
                sx={{ mb: 1, fontSize: 11 }}
              >
                استفاده از تمپلیت پیشنهادی
              </Button>
            )}
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              value={extraValue}
              onChange={(e) => onChangeField(module.extraKey, e.target.value)}
              placeholder="دستورات اضافی (اختیاری)..."
              sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8, bgcolor: (theme) => alpha(theme.palette.success.main, 0.03) } }}
            />
          </Box>
        )}
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

export function SettingsView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('tokens');
  const [changes, setChanges] = useState({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.settings.list);
      return res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (updates) => {
      const res = await axiosInstance.put(endpoints.settings.update, updates);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setChanges({});
    },
  });

  const handleChange = (key, value) => setChanges((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const updates = Object.entries(changes).map(([key, value]) => ({ key, value }));
    if (updates.length > 0) saveMutation.mutate(updates);
  };

  const items = settings || [];
  const getValue = (key) => (changes[key] !== undefined ? changes[key] : (items.find((s) => s.key === key)?.value || ''));
  const isChanged = (key) => changes[key] !== undefined;

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <DashboardContent maxWidth="lg">
      <PageInfoBox {...PAGE_INFO} />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>تنظیمات سامانه</Typography>
          <Typography variant="body2" color="text.secondary">مدیریت کلیدهای API، تنظیم روایت و رادار، شخصی‌سازی پرامپت‌های AI</Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          disabled={!hasChanges || saveMutation.isPending}
          startIcon={saveMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <Iconify icon="solar:check-circle-bold" />}
        >
          {saveMutation.isPending ? 'در حال ذخیره...' : `ذخیره تغییرات${hasChanges ? ` (${Object.keys(changes).length})` : ''}`}
        </Button>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={(theme) => ({ borderBottom: `1px solid ${theme.palette.divider}` })}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon={tab.icon} width={20} sx={{ color: `${tab.color}.main` }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{tab.label}</Typography>
                </Stack>
              }
              sx={{ minHeight: 64 }}
            />
          ))}
        </Tabs>
      </Card>

      {isLoading ? (
        <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>
      ) : (
        <Box>
          {/* Tab 1: API Tokens */}
          {activeTab === 'tokens' && (
            <Stack spacing={3}>
              <Card sx={(theme) => ({ p: 2, bgcolor: alpha(theme.palette.error.main, 0.04), border: `1px solid ${alpha(theme.palette.error.main, 0.1)}` })}>
                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                  <Iconify icon="solar:shield-keyhole-bold-duotone" width={22} sx={{ color: 'error.main', mt: 0.25 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>کلیدهای API</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      این کلیدها برای اتصال سامانه به سرویس‌های خارجی لازم هستند. بدون این کلیدها بخش‌های مربوطه کار نمی‌کنند. کلیدها رمزگذاری نمایش داده می‌شوند — برای دیدن روی آیکون چشم بزنید.
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                  <Iconify icon="solar:key-bold-duotone" width={18} sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                  کلیدهای دسترسی
                </Typography>
                <Stack spacing={2}>
                  {TOKEN_CARDS.map((card) => (
                    <TokenCard
                      key={card.key}
                      card={card}
                      value={getValue(card.key)}
                      onChange={(e) => handleChange(card.key, e.target.value)}
                      isChanged={isChanged(card.key)}
                    />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                  <Iconify icon="solar:cpu-bolt-bold-duotone" width={18} sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                  مدل‌های هوش مصنوعی
                </Typography>
                <Stack spacing={2}>
                  {MODEL_CARDS.map((card) => (
                    <ModelCard
                      key={card.key}
                      card={card}
                      value={getValue(card.key)}
                      onChange={(e) => handleChange(card.key, e.target.value)}
                      isChanged={isChanged(card.key)}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}

          {/* Tab 2: Narrative & Radar */}
          {activeTab === 'narrative' && (
            <Stack spacing={3}>
              <Card sx={(theme) => ({ p: 2, bgcolor: alpha(theme.palette.success.main, 0.04), border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` })}>
                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                  <Iconify icon="solar:target-bold-duotone" width={22} sx={{ color: 'success.main', mt: 0.25 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>روایت مطلوب و رادار سکوت</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      این تنظیمات تعیین می‌کنند که سامانه «موفقیت» یا «شکاف پوشش» را چگونه بسنجد. کلمات کلیدی روایت مدنظر شما باعث می‌شوند شاخص هم‌راستایی هفته در داشبورد محاسبه شود. موضوعات رادار سکوت نیز نشان می‌دهند شبکه درباره چه موضوعاتی پوشش نداده.
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              {NARRATIVE_CARDS.map((card) => (
                <NarrativeCard
                  key={card.key}
                  card={card}
                  value={getValue(card.key)}
                  onChange={(e) => handleChange(card.key, e.target.value)}
                  isChanged={isChanged(card.key)}
                />
              ))}
            </Stack>
          )}

          {/* Tab 3: Prompts */}
          {activeTab === 'prompts' && (
            <Stack spacing={3}>
              <Card sx={(theme) => ({ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.04), border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}` })}>
                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                  <Iconify icon="solar:cpu-bolt-bold-duotone" width={22} sx={{ color: 'warning.main', mt: 0.25 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>پرامپت‌های هوش مصنوعی</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      هر ماژول AI یک «پرامپت سیستمی» دارد که نقش و اهداف هوش مصنوعی را تعریف می‌کند. با ویرایش این پرامپت‌ها می‌توانید لحن، دقت و سبک خروجی را کنترل کنید. اگر فقط می‌خواهید تنظیم کوچکی اعمال کنید، از فیلد «دستورات اضافی» استفاده کنید.
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              {PROMPT_MODULES.map((module) => (
                <PromptCard
                  key={module.key}
                  module={module}
                  settings={items}
                  changes={changes}
                  onChangeField={handleChange}
                />
              ))}
            </Stack>
          )}
        </Box>
      )}
    </DashboardContent>
  );
}
