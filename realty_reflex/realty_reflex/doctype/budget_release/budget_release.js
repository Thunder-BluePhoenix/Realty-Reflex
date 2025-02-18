// Copyright (c) 2025, Thunder and contributors
// For license information, please see license.txt

frappe.ui.form.on("Budget Release", {
	refresh(frm) {
        frm.disable_save()
        frm.clear_table("changed_tasks")
        frm.add_custom_button(__('Staged'), function() {
            frappe.call({
                method: "stage_changes",
                doc:frm.doc,
                args:{
                    "changed_tasks":frm.doc.changed_tasks
                },
                callback: function(r) {
                    frm.refresh_fields("staged_tasks")
                        
                    
                }
            });
        })
        frm.add_custom_button(__('Unstaged'), function() {
            frappe.call({
                method: "unstaged_changes",
                doc:frm.doc,
                args:{
                    "staged_tasks":frm.doc.staged_tasks
                },
                callback: function(r) {
                    frm.refresh_fields("staged_tasks")
                    frm.refresh_fields("changed_tasks")
                        
                    
                }
            });
        })
	},
    fetch_tasks(frm){
        frm.clear_table("changed_tasks")
        frm.clear_table("staged_tasks")
        frappe.call({
            method: "get_changed_tasks",
            doc:frm.doc,
            callback: function(r) {
                frm.refresh_fields("changed_tasks")
            }
        });
    },
    release(frm){
        frappe.call({
            method: "release",
            doc:frm.doc,
            args:{
                "staged_tasks":frm.doc.staged_tasks
            },
            callback: function(r) {
            }
        });
    }
});
