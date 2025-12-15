import type { JSX } from "react";

import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import PageHeader from "@/components/layout/PageHeader";
import SocialIcon from "@/components/ui/SocialIcon";
import { Text } from "@/components/ui/typography";

const CONTACT_EMAIL = "mvabrigosbrasil@gmail.com";
const WHATSAPP_LINK = "https://api.whatsapp.com/send?phone=5541995192977";

export default function Page(): JSX.Element {
  return (
    <main>
      <PageHeader
        title="Contato"
        breadcrumbs={[{ label: "Inicial", href: "/" }, { label: "Contato" }]}
      />

      <section className="bg-white">
        <div className="container px-6 py-16">
          <div className="mx-auto flex max-w-4xl flex-col gap-10">
            <ContactInfo email={CONTACT_EMAIL} />

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(0,0,0,0.04)] sm:p-10">
              <ContactForm />
            </div>

            <div className="space-y-3 text-center">
              <Text className="text-[#4f5464]">Ou chame no Whatsapp</Text>
              <div className="flex justify-center">
                <a
                  className="inline-flex items-center gap-3 rounded-full bg-[#0b8f47] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(11,143,71,0.2)] transition hover:bg-[#0a7c3d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b8f47]"
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chamar no WhatsApp"
                >
                  <SocialIcon name="whatsapp" size={18} className="text-white" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
