import type { Metadata } from "next";

import ContactManager from "./ContactManager";

export const metadata: Metadata = { title: "Contact Admin" };

export default function ContactAdminPage() {
  return (
    <div className="page contact-layout">
      <header>
        <p className="eyebrow">Admin</p>
        <h1>Contact messages</h1>
        <p className="lede">
          Read, edit and delete contact submissions through /api/contact. This page is not in the
          site navigation.
        </p>
      </header>
      <ContactManager />
    </div>
  );
}
