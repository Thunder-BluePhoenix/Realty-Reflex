import frappe
from frappe import _
from frappe.model.document import Document








def before_save(doc, method = None):
    if doc.custom_total_budget_allocated and doc.custom_allocated_amount:
        allocated_amo = doc.custom_allocated_amount
        amo = doc.custom_total_budget_allocated
        doc.custom_amount = doc.custom_total_budget_allocated
        if allocated_amo > amo:
            frappe.throw("Allocated Ammount can not be greater than Total Amount")
        else:
            doc.custom_pending_amount =  amo - allocated_amo


def validate(doc, method = None):
# Store previous values in cache for comparison
    if not hasattr(doc, '_previous_values'):
        doc._previous_values = frappe._dict({
            'custom_remark': doc.get_doc_before_save().custom_remark if doc.get_doc_before_save() else None,
            'custom_allocated_amount': doc.get_doc_before_save().custom_allocated_amount if doc.get_doc_before_save() else None,
            'custom_rate': doc.get_doc_before_save().custom_rate if doc.get_doc_before_save() else None,
            'custom_budget_type': doc.get_doc_before_save().custom_budget_type if doc.get_doc_before_save() else None,
            'custom_builtup_area':doc.get_doc_before_save().custom_builtup_area if doc.get_doc_before_save() else None,
            'custom_attach': doc.get_doc_before_save().custom_attach if doc.get_doc_before_save() else None

    })