import frappe

from frappe.contacts.address_and_contact import (
    delete_contact_and_address,
    load_address_and_contact,
)


def onload(self, method):
        """Load address and contacts in __onload"""
        load_address_and_contact(self)


def on_trash(self, method):
        delete_contact_and_address(self.doctype,self.name)