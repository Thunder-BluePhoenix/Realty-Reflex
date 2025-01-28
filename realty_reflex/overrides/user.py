import frappe
from frappe import STANDARD_USERS, _, msgprint, throw
from frappe.utils import cint


def send_welcome_mail(self, method):
    if self.name not in STANDARD_USERS:
        

        if (
            
             cint(self.send_welcome_email)
           
        ):
            self.send_welcome_mail_to_user()
            self.flags.email_sent = 1
            if frappe.session.user != "Guest":
                msgprint(_("Welcome email sent"))
            return



def send_welcome_mail_to_user(self):
		from frappe.utils import get_url

		link = self.reset_password()
		subject = None
		method = frappe.get_hooks("welcome_email")
		if method:
			subject = frappe.get_attr(method[-1])()
		if not subject:
			site_name = frappe.db.get_default("site_name") or frappe.get_conf().get("site_name")
			if site_name:
				subject = _("Welcome to {0}").format(site_name)
			else:
				subject = _("Complete Registration")

		welcome_email_template = frappe.db.get_system_setting("welcome_email_template")

		self.send_login_mail(
			subject,
			"new_user",
			dict(
				link=link,
				site_url=get_url(),
			),
			custom_template=welcome_email_template,
		)