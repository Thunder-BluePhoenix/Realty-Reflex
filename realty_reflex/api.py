



import frappe

@frappe.whitelist()
def release_version(project):
    doc=frappe.new_doc("Budget Release Log")
    doc.project=project 
    doc.task_dict=str(generate_task_tree(project))
    doc.save(ignore_permissions=True)


@frappe.whitelist()
def get_project_task_status(project):
    task_status = frappe.db.get_value("Task", {"project": project, "is_group": 1}, "custom_wbs_status")
    return task_status

@frappe.whitelist()
def generate_task_tree(project):
    """
    Generate a task tree JSON structure based on the provided data.

    Args:
        values (str): JSON string containing subprojects and templates.

    Returns:
        dict: Task tree JSON structure.
    """
    task_tree = {}

    tasks = frappe.db.get_all(
        "Task",
        filters={"project": project, "is_group": 1,"parent_task":""},
        fields=["name", "custom_total_budget_allocated", "custom_builtup_area", "custom_rate", 
                "custom_budget_type", "custom_allocated_amount", "custom_pending_amount", 
                "custom_remark", "parent_task"]
    )
    child_tasks = frappe.db.get_all(
        "Task",
        filters={"project": project},
        fields=["name", "custom_total_budget_allocated", "custom_builtup_area", "custom_rate", 
                "custom_budget_type", "custom_allocated_amount", "custom_pending_amount", 
                "custom_remark", "parent_task"]
    )
    no_tasks = frappe.db.get_all(
        "Task",
        filters={"project": project, "is_group": 0,"parent_task":""},
        fields=["name", "custom_total_budget_allocated", "custom_builtup_area", "custom_rate", 
                "custom_budget_type", "custom_allocated_amount", "custom_pending_amount", 
                "custom_remark", "parent_task"]
    )
    # Build the task tree for this subproject and template
    for task_data in tasks:
        # Create root-level group tasks
        task_tree[task_data.name] = {
            "custom_total_budget_allocated": task_data.custom_total_budget_allocated,
            "custom_builtup_area": task_data.custom_builtup_area,
            "custom_rate": task_data.custom_rate,
            "custom_budget_type": task_data.custom_budget_type,
            "custom_allocated_amount": task_data.custom_allocated_amount,
            "custom_pending_amount": task_data.custom_pending_amount,
            "custom_remark": task_data.custom_remark,
            "custom_builtup_area": task_data.custom_builtup_area,
            "children": build_task_tree_json(task_data.name, child_tasks)
        }
    for task_data_child in no_tasks:
        task_tree[task_data_child.name] = {
            "custom_total_budget_allocated": task_data_child.custom_total_budget_allocated,
            "custom_builtup_area": task_data_child.custom_builtup_area,
            "custom_rate": task_data_child.custom_rate,
            "custom_budget_type": task_data_child.custom_budget_type,
            "custom_allocated_amount": task_data_child.custom_allocated_amount,
            "custom_pending_amount": task_data_child.custom_pending_amount,
            "custom_remark": task_data_child.custom_remark,
            "custom_builtup_area": task_data_child.custom_builtup_area,
            "children": build_task_tree_json(task_data_child.name, child_tasks)
        }
    return task_tree


def build_task_tree_json(parent_task_id, tasks):
    """
    Recursively build the task tree JSON.

    Args:
        parent_task_id (str): ID of the parent task in the WBS Template.
        tasks (dict): Dictionary of tasks indexed by task_id from the WBS Template.

    Returns:
        dict: Task tree JSON structure for children of the given parent.
    """
    tree = {}

    for task_data in tasks:
        if task_data.parent_task == parent_task_id:
            # Create child task entry in the tree
            tree[task_data.name] = {
                "custom_total_budget_allocated": task_data.custom_total_budget_allocated,
                "custom_builtup_area": task_data.custom_builtup_area,
                "custom_rate": task_data.custom_rate,
                "custom_budget_type": task_data.custom_budget_type,
                "custom_allocated_amount": task_data.custom_allocated_amount,
                "custom_pending_amount": task_data.custom_pending_amount,
                "custom_remark": task_data.custom_remark,
                "custom_builtup_area": task_data.custom_builtup_area,
                "children": build_task_tree_json(task_data.name, tasks)
            }
    return tree










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
