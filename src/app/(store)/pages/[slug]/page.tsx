import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Section {
  heading: string;
  body: string;
}

interface PageContent {
  title: string;
  description: string;
  sections: Section[];
}

const PAGES: Record<string, PageContent> = {
  faq: {
    title: "Frequently Asked Questions",
    description: "Answers to the most common questions about EYEWEAR.",
    sections: [
      {
        heading: "What materials are your frames made from?",
        body: "Our frames are made from premium acetate, lightweight titanium, and durable stainless steel — depending on the collection. Each material is selected for comfort, durability, and style.",
      },
      {
        heading: "Do your sunglasses offer UV protection?",
        body: "Yes. All EYEWEAR sunglasses provide 100% UV400 protection, blocking both UVA and UVB rays. Our lenses meet international optical standards.",
      },
      {
        heading: "How do I find the right frame size?",
        body: "We recommend checking our Frame Sizing Guide for detailed measurements. Each product page also lists lens width, bridge width, and temple length.",
      },
      {
        heading: "Can I return or exchange my order?",
        body: "Yes — we offer a 30-day return and exchange policy on all unworn items in original packaging. See our Shipping & Returns page for full details.",
      },
      {
        heading: "How long does shipping take?",
        body: "Standard shipping takes 3–7 business days within the US. Express shipping (1–2 business days) is available at checkout. Orders over $150 ship free.",
      },
      {
        heading: "Do you ship internationally?",
        body: "Yes, we ship to Canada, the United Kingdom, Australia, and Vietnam. International shipping typically takes 7–14 business days.",
      },
    ],
  },

  shipping: {
    title: "Shipping & Returns",
    description: "Everything you need to know about shipping, delivery, and returns.",
    sections: [
      {
        heading: "Shipping Rates",
        body: "Free standard shipping on all orders over $150. Standard shipping (3–7 business days) is $9.99. Express shipping (1–2 business days) is available for $19.99.",
      },
      {
        heading: "Processing Time",
        body: "Orders are processed within 1–2 business days. You will receive a shipping confirmation email with a tracking number once your order has been dispatched.",
      },
      {
        heading: "International Shipping",
        body: "We ship to Canada, the United Kingdom, Australia, and Vietnam. International orders typically arrive within 7–14 business days. Customers are responsible for any applicable customs duties or import taxes.",
      },
      {
        heading: "30-Day Returns",
        body: "We accept returns within 30 days of delivery for unworn items in their original packaging. Items must be in the same condition as received.",
      },
      {
        heading: "How to Initiate a Return",
        body: "To start a return, contact us at support@eyewear.com with your order number. We will provide a return label and instructions within 1–2 business days.",
      },
      {
        heading: "Refunds",
        body: "Refunds are processed to the original payment method within 5–10 business days of receiving your return. Original shipping fees are non-refundable unless the return is due to our error.",
      },
    ],
  },

  sizing: {
    title: "Frame Sizing Guide",
    description: "Find your perfect fit with our comprehensive frame sizing guide.",
    sections: [
      {
        heading: "Understanding Frame Measurements",
        body: "Eyewear frames have three key measurements printed on the inside of the temple arm: lens width (the width of each lens in mm), bridge width (the distance between the lenses), and temple length (the arm that goes over your ear).",
      },
      {
        heading: "How to Measure Your Face",
        body: "To find your ideal frame width, measure your face at its widest point (usually across the cheekbones). Frames should be roughly the same width as your face for the most flattering look.",
      },
      {
        heading: "Frame Size Guide",
        body: "Narrow frames: lens width under 50mm. Medium frames: 51–54mm. Wide frames: 55mm and above. Our product pages list exact measurements for each style.",
      },
      {
        heading: "Fit Tips",
        body: "The frame should sit comfortably on your nose without pinching, and the temples should rest lightly on your ears. The top of the frame should align with your eyebrows.",
      },
    ],
  },

  contact: {
    title: "Contact Us",
    description: "We'd love to hear from you. Reach out with any questions or feedback.",
    sections: [
      {
        heading: "Customer Support",
        body: "Email: support@eyewear.com\nResponse time: within 1–2 business days, Monday to Friday.",
      },
      {
        heading: "Order Inquiries",
        body: "For questions about an existing order, please include your order number in your message. You can also track your order status in your account under Orders.",
      },
      {
        heading: "Returns & Exchanges",
        body: "To start a return or exchange, email us at support@eyewear.com with your order number and reason for return. See our Shipping & Returns page for full policy details.",
      },
      {
        heading: "Business & Press",
        body: "For wholesale, press inquiries, or partnerships, please contact us at hello@eyewear.com.",
      },
    ],
  },

  about: {
    title: "About EYEWEAR",
    description: "Our story, mission, and commitment to quality eyewear.",
    sections: [
      {
        heading: "Our Story",
        body: "EYEWEAR was founded with a simple belief: everyone deserves premium eyewear without the premium price tag. We work directly with expert craftspeople to bring you frames that combine timeless design with exceptional quality.",
      },
      {
        heading: "Our Mission",
        body: "We are committed to making great eyewear accessible — whether you need UV protection from the sun, blue light filtering for screens, or frames that simply make you feel your best.",
      },
      {
        heading: "Quality & Craftsmanship",
        body: "Every frame in our collection goes through rigorous quality checks before reaching you. We use only premium materials — optical-grade acetate, lightweight titanium, and corrosion-resistant stainless steel.",
      },
      {
        heading: "Sustainability",
        body: "We are working toward more sustainable packaging and supply chains. Our boxes are made from recycled materials, and we are committed to reducing our environmental footprint year over year.",
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    description: "How we collect, use, and protect your personal information.",
    sections: [
      {
        heading: "Information We Collect",
        body: "We collect information you provide directly to us when placing an order — including your name, email address, shipping address, and payment information. Payment details are processed securely by Stripe and never stored on our servers.",
      },
      {
        heading: "How We Use Your Information",
        body: "We use your information to process and fulfill orders, send order confirmations and shipping updates, and improve our services. With your consent, we may also send promotional emails about new products and offers.",
      },
      {
        heading: "Cookies & Tracking",
        body: "We use cookies and similar technologies to operate our website, understand usage patterns, and serve relevant advertising through platforms like Meta (Facebook/Instagram). You can manage cookie preferences through your browser settings.",
      },
      {
        heading: "Data Sharing",
        body: "We do not sell your personal information. We share data only with trusted service providers who help us operate our business — including Stripe (payments), Supabase (database), and Resend (email). These partners are contractually bound to protect your data.",
      },
      {
        heading: "Your Rights",
        body: "You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at privacy@eyewear.com.",
      },
      {
        heading: "Contact",
        body: "For privacy-related questions, please email privacy@eyewear.com.",
      },
    ],
  },

  terms: {
    title: "Terms of Service",
    description: "The terms and conditions that govern your use of EYEWEAR.",
    sections: [
      {
        heading: "Acceptance of Terms",
        body: "By accessing or using eyewear.com, you agree to be bound by these Terms of Service. If you do not agree, please do not use our website.",
      },
      {
        heading: "Products & Pricing",
        body: "All prices are listed in USD and are subject to change without notice. We reserve the right to limit quantities, refuse orders, or discontinue products at any time.",
      },
      {
        heading: "Order Acceptance",
        body: "Placing an order does not constitute a contract until we confirm acceptance by email. We reserve the right to cancel orders for any reason, including pricing errors or suspected fraud, with a full refund.",
      },
      {
        heading: "Intellectual Property",
        body: "All content on this website — including images, text, and trademarks — is the property of EYEWEAR and may not be reproduced without our written permission.",
      },
      {
        heading: "Limitation of Liability",
        body: "To the extent permitted by law, EYEWEAR shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.",
      },
      {
        heading: "Governing Law",
        body: "These terms are governed by the laws of the State of California, United States, without regard to its conflict of law provisions.",
      },
      {
        heading: "Changes to Terms",
        body: "We may update these terms at any time. Continued use of our website after changes constitutes acceptance of the new terms.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) return { title: "Not Found" };
  return { title: page.title, description: page.description };
}

export default async function StaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl font-bold mb-2">{page.title}</h1>
      <p className="text-neutral-500 mb-10">{page.description}</p>

      <div className="space-y-8">
        {page.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-base font-semibold mb-2">{section.heading}</h2>
            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
