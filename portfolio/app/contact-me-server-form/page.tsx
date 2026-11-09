import type { Metadata } from "next";

import ContactForm from "./ContactForm";

export const metadata: Metadata = { title: "Contact Me" };

export default function ContactMeServerFormPage() {
  return (
    <div className="page contact-layout">
      <header>
        <p className="eyebrow">Contact</p>
        <h1>Say hello</h1>
        <p className="lede">Roles in AI product marketing, a project idea, or a question about something here. All welcome.</p>
        <ul className="plain-links">
          <li><a href="mailto:lizhongwang10@gmail.com">lizhongwang10@gmail.com</a></li>
          <li><a href="https://x.com/Pickle_1024">X @Pickle_1024</a></li>
          <li><a href="https://www.linkedin.com/in/lizhongwang/">LinkedIn</a></li>
          <li><a href="https://github.com/Pickle1024">GitHub Pickle1024</a></li>
        </ul>
      </header>
      <ContactForm />
    </div>
  );
}
