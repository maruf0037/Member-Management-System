import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "activities": "Activities",
        "donate": "Donate",
        "memberLogin": "Member Login"
      },
      "home": {
        "title": "Zero Seven Foundation",
        "subtitle": "Empowering communities through friendship, service, and collective action. A legacy of the SSC-07 batch of Haragach.",
        "supportCause": "Support Our Cause",
        "ourActivities": "Our Activities",
        "missionVision": "Our Mission & Vision",
        "mission": "Mission",
        "missionText": "To provide immediate support to those in need within our community, focusing on health, education, and social welfare through the united efforts of our members.",
        "vision": "Vision",
        "visionText": "To become a sustainable platform for social change where friendship serves as the foundation for impactful community development and humanitarian aid.",
        "projectsCompleted": "Projects Completed",
        "storyTitle": "The Story Behind Our Friendship",
        "storyP1": "It all started in 2007 at Haragach. We were just a group of students sharing dreams and laughter. As we grew up and moved into different paths of life, our bond remained unshakable. In 2022, we decided that our friendship should mean something more to the world.",
        "storyP2": "Zero Seven Foundation was born from the idea that the same friends who stood by each other during exams and teenage struggles could stand together to help a neighbor in distress, fund a child's education, or provide emergency medical aid.",
        "batch": "SSC-07 Batch",
        "foundation": "The Foundation",
        "socialWelfare": "Social Welfare",
        "purpose": "Our Purpose",
        "haragach": "Haragach",
        "roots": "Our Roots",
        "joinJourney": "Join Our Journey",
        "joinText": "Whether you are a batchmate or a well-wisher, your support can change lives. Let's build a better tomorrow together.",
        "donateNow": "Donate Now",
        "viewWork": "View Our Work"
      },
      "donate": {
        "title": "Support Our Mission",
        "subtitle": "Your contributions directly fund our social welfare projects. Every donation, no matter how small, makes a significant difference.",
        "howToDonate": "How to Donate",
        "contactUs": "Contact Us",
        "getInTouch": "Get in Touch",
        "getInTouchDesc": "Have questions or want to collaborate? Send us a message and we'll get back to you.",
        "fullName": "Full Name",
        "email": "Email Address",
        "subject": "Subject",
        "message": "Message",
        "sendMessage": "Send Message"
      },
      "footer": {
        "desc": "A non-profit organization dedicated to social welfare, friendship, and community support. Established by the SSC-07 batch of Haragach.",
        "quickLinks": "Quick Links",
        "contactUs": "Contact Us",
        "rights": "Zero Seven Foundation. All rights reserved."
      }
    }
  },
  bn: {
    translation: {
      "nav": {
        "home": "হোম",
        "activities": "কার্যক্রম",
        "donate": "দান করুন",
        "memberLogin": "মেম্বার লগইন"
      },
      "home": {
        "title": "জিরো সেভেন ফাউন্ডেশন",
        "subtitle": "বন্ধুত্ব, সেবা এবং সম্মিলিত উদ্যোগের মাধ্যমে সমাজকে ক্ষমতায়ন করা। হারাগাছ এসএসসি-০৭ ব্যাচের একটি উদ্যোগ।",
        "supportCause": "আমাদের পাশে দাঁড়ান",
        "ourActivities": "আমাদের কার্যক্রম",
        "missionVision": "আমাদের লক্ষ্য ও উদ্দেশ্য",
        "mission": "লক্ষ্য",
        "missionText": "আমাদের সদস্যদের সম্মিলিত প্রচেষ্টার মাধ্যমে স্বাস্থ্য, শিক্ষা এবং সমাজকল্যাণের উপর দৃষ্টি নিবদ্ধ করে সমাজের অসহায় মানুষদের তাৎক্ষণিক সহায়তা প্রদান করা।",
        "vision": "উদ্দেশ্য",
        "visionText": "সামাজিক পরিবর্তনের জন্য একটি টেকসই প্ল্যাটফর্ম তৈরি করা, যেখানে বন্ধুত্বই হবে সমাজের উন্নয়ন এবং মানবিক সহায়তার মূল ভিত্তি।",
        "projectsCompleted": "প্রজেক্ট সম্পন্ন",
        "storyTitle": "আমাদের বন্ধুত্বের পেছনের গল্প",
        "storyP1": "২০০৭ সালে হারাগাছে আমাদের শুরু। আমরা ছিলাম একদল স্বপ্নবাজ ছাত্র। বড় হওয়ার সাথে সাথে আমরা জীবনের বিভিন্ন পথে পা বাড়ালেও আমাদের বন্ধন অটুট ছিল। ২০২২ সালে আমরা সিদ্ধান্ত নিই যে আমাদের বন্ধুত্ব সমাজের জন্য আরও অর্থবহ হওয়া উচিত।",
        "storyP2": "জিরো সেভেন ফাউন্ডেশনের জন্ম এই ধারণা থেকেই যে, যে বন্ধুরা পরীক্ষার সময় এবং কৈশোরের সংগ্রামগুলোতে একে অপরের পাশে দাঁড়িয়েছিল, তারাই আজ বিপদে পড়া প্রতিবেশীকে সাহায্য করতে, কোনো শিশুর শিক্ষার খরচ জোগাতে বা জরুরি চিকিৎসা সহায়তা দিতে একসাথে দাঁড়াতে পারে।",
        "batch": "এসএসসি-০৭ ব্যাচ",
        "foundation": "আমাদের ভিত্তি",
        "socialWelfare": "সমাজকল্যাণ",
        "purpose": "আমাদের উদ্দেশ্য",
        "haragach": "হারাগাছ",
        "roots": "আমাদের শেকড়",
        "joinJourney": "আমাদের সাথে যুক্ত হোন",
        "joinText": "আপনি আমাদের ব্যাচমেট হোন বা শুভাকাঙ্ক্ষী, আপনার সমর্থন জীবন বদলে দিতে পারে। আসুন একসাথে একটি সুন্দর আগামী গড়ি।",
        "donateNow": "দান করুন",
        "viewWork": "আমাদের কাজ দেখুন"
      },
      "donate": {
        "title": "আমাদের মিশনে সহায়তা করুন",
        "subtitle": "আপনার অনুদান সরাসরি আমাদের সমাজকল্যাণমূলক প্রকল্পগুলোতে অর্থায়ন করে। প্রতিটি অনুদান, তা যত ছোটই হোক না কেন, একটি বড় পরিবর্তন আনতে পারে।",
        "howToDonate": "কীভাবে দান করবেন",
        "contactUs": "যোগাযোগ করুন",
        "getInTouch": "আমাদের সাথে যোগাযোগ করুন",
        "getInTouchDesc": "আপনার কি কোনো প্রশ্ন আছে বা আমাদের সাথে কাজ করতে চান? আমাদের একটি বার্তা পাঠান এবং আমরা আপনার সাথে যোগাযোগ করব।",
        "fullName": "পুরো নাম",
        "email": "ইমেইল ঠিকানা",
        "subject": "বিষয়",
        "message": "বার্তা",
        "sendMessage": "বার্তা পাঠান"
      },
      "footer": {
        "desc": "সমাজকল্যাণ, বন্ধুত্ব এবং সামাজিক সহায়তায় নিবেদিত একটি অলাভজনক সংস্থা। হারাগাছের এসএসসি-০৭ ব্যাচ দ্বারা প্রতিষ্ঠিত।",
        "quickLinks": "প্রয়োজনীয় লিংক",
        "contactUs": "যোগাযোগ",
        "rights": "জিরো সেভেন ফাউন্ডেশন। সর্বস্বত্ব সংরক্ষিত।"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
