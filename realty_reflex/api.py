



import frappe


def release_version():
    pass












@frappe.whitelist()
def lock_project_tasks(project):
    if not project:
        frappe.throw(frappe._("Project is required"))

    tasks = frappe.get_all("Task", filters={"project": project}, fields=["name", "status"])

    for task in tasks:
        frappe.db.set_value("Task", task.name, "custom_wbs_status", "Locked")



@frappe.whitelist()
def unlock_project_tasks(project):
    if not project:
        frappe.throw(frappe._("Project is required"))

    tasks = frappe.get_all("Task", filters={"project": project}, fields=["name", "status"])

    for task in tasks:
        frappe.db.set_value("Task", task.name, "custom_wbs_status", "Unlocked")
