app_name = "realty_reflex"
app_title = "Realty Reflex"
app_publisher = "Thunder"
app_description = "Realty Reflex"
app_email = "bluephoenix00995@gmail.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "realty_reflex",
# 		"logo": "/assets/realty_reflex/logo.png",
# 		"title": "Realty Reflex",
# 		"route": "/realty_reflex",
# 		"has_permission": "realty_reflex.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/realty_reflex/css/material_grid.css"
app_include_js = [
    "/assets/realty_reflex/js/custom_navbar.js",
    # "/assets/realty_reflex/js/material_gridd.js"
    ]

# include js, css files in header of web template
# web_include_css = "/assets/realty_reflex/css/realty_reflex.css"
# web_include_js = "/assets/realty_reflex/js/realty_reflex.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "realty_reflex/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {
    "Project": "public/js/project.js",
    "Task": "public/js/task.js",
    "Unit": "public/js/unit.js"
}

doctype_list_js = {
    "Project": "public/js/project_list.js"
}

# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
doctype_tree_js = {"Task" : "public/js/wbsss.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "realty_reflex/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "realty_reflex.utils.jinja_methods",
# 	"filters": "realty_reflex.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "realty_reflex.install.before_install"
# after_install = "realty_reflex.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "realty_reflex.uninstall.before_uninstall"
# after_uninstall = "realty_reflex.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "realty_reflex.utils.before_app_install"
# after_app_install = "realty_reflex.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "realty_reflex.utils.before_app_uninstall"
# after_app_uninstall = "realty_reflex.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "realty_reflex.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events.validate_budget_amount

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }
doc_events = {
    "Task" : {
        "before_save":[
                             "realty_reflex.overrides.task.before_save",
                             "realty_reflex.api.release_version"],
              "on_update":["realty_reflex.overrides.task.on_update",
                           "realty_reflex.overrides.task.allocated_amount_validation",
                           ]},

    "Project": {"onload":"realty_reflex.overrides.project.onload",
                "on_trash":"realty_reflex.overrides.project.on_trash"},


}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"realty_reflex.tasks.all"
# 	],
# 	"daily": [
# 		"realty_reflex.tasks.daily"
# 	],
# 	"hourly": [
# 		"realty_reflex.tasks.hourly"
# 	],
# 	"weekly": [
# 		"realty_reflex.tasks.weekly"
# 	],
# 	"monthly": [
# 		"realty_reflex.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "realty_reflex.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "realty_reflex.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "realty_reflex.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["realty_reflex.utils.before_request"]
# after_request = ["realty_reflex.utils.after_request"]

# Job Events
# ----------
# before_job = ["realty_reflex.utils.before_job"]
# after_job = ["realty_reflex.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"realty_reflex.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

