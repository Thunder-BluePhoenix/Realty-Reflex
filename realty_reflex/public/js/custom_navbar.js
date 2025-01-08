frappe.provide('frappe.project_selector');

// Add CSS styles directly in JS
const style = document.createElement('style');
style.textContent = `
    .project-selector-wrapper {
        display: inline-flex;
        align-items: center;
        margin-left: 10px;
        position: relative;
    }

    .project-selector-wrapper .btn {
        height: 28px;
        padding: 4px 8px;
        border: 1px solid var(--gray-300);
        background-color: var(--bg-color);
        color: var(--text-color);
        font-size: var(--text-sm);
        border-radius: var(--border-radius);
    }

    .project-selector-wrapper .btn:hover {
        background-color: var(--bg-light-gray);
    }

    .project-selector-wrapper .dropdown-menu {
        max-height: 300px;
        overflow-y: auto;
        min-width: 200px;
        margin-top: 4px;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--gray-200);
        border-radius: var(--border-radius-md);
    }

    .project-selector-wrapper .dropdown-menu li a {
        padding: 8px 12px;
        color: var(--text-color);
        font-size: var(--text-sm);
        display: block;
        text-decoration: none;
    }

    .project-selector-wrapper .dropdown-menu li a:hover {
        background-color: var(--bg-light-gray);
    }

    .project-selector-wrapper .btn-project {
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    .project-selector-wrapper .project-icon {
        color: var(--text-muted);
        font-size: 12px;
    }
`;
document.head.appendChild(style);

frappe.project_selector.ProjectSelector = class ProjectSelector {
    constructor() {
        this.project_link_fields_cache = {};
        this.setup();
    }

    setup() {
        this.create_project_selector();
        this.bind_events();
        this.load_projects();
        
        // Load previously selected project
        const saved_project = localStorage.getItem('selected_project');
        if (saved_project) {
            this.set_project(saved_project, false);
        }
    }

    create_project_selector() {
        // Find the search bar container
        const $searchBar = $('.search-bar');
        
        this.$wrapper = $(`
            <div class="project-selector-wrapper">
                <div class="dropdown">
                    <button class="btn btn-project" type="button" data-toggle="dropdown">
                        <i class="fa fa-folder-o project-icon"></i>
                        <span class="project-label">Select Project</span>
                        <i class="fa fa-chevron-down project-icon"></i>
                    </button>
                    <ul class="dropdown-menu project-list dropdown-menu-right"></ul>
                </div>
            </div>
        `).insertAfter($searchBar);

        this.$project_list = this.$wrapper.find('.project-list');
        this.$project_label = this.$wrapper.find('.project-label');
    }

    async get_project_link_fields(doctype) {
        if (!doctype) return [];

        if (this.project_link_fields_cache[doctype]) {
            return this.project_link_fields_cache[doctype];
        }

        try {
            await frappe.model.with_doctype(doctype);
            const meta = frappe.get_meta(doctype);
            
            if (!meta) return [];

            const fields = meta.fields || [];
            const project_fields = fields.filter(field => {
                return (field.fieldtype === 'Link' && field.options === 'Project') ||
                       (field.fieldtype === 'Dynamic Link' && field.options === 'Project');
            }).map(field => field.fieldname);

            this.project_link_fields_cache[doctype] = project_fields;
            return project_fields;
        } catch (error) {
            console.error(`Error getting project fields for ${doctype}:`, error);
            return [];
        }
    }

    bind_events() {
        // Handle project selection
        this.$project_list.on('click', 'li a', (e) => {
            e.preventDefault();
            const project = $(e.currentTarget).data('project');
            this.set_project(project, true);
        });

        // Handle route changes
        frappe.router.on('change', () => {
            setTimeout(() => this.handle_route_change(), 500);
        });

        // Handle list view refresh
        $(document).on('page-change list_view_rendered', () => {
            setTimeout(() => this.handle_page_change(), 500);
        });
    }

    async handle_route_change() {
        const route = frappe.get_route();
        if (!route || !route.length || route[0] === 'Workspaces') return;

        // Clear existing filters first
        await this.clear_all_filters();

        // Then apply new filters if a project is selected
        if (frappe.project_selector.current_project) {
            await this.apply_filters_on_route_change();
        }
    }

    async handle_page_change() {
        const route = frappe.get_route();
        if (!route || route[0] !== 'List' || route[0] === 'Workspaces') return;

        // Clear existing filters first
        await this.clear_all_filters();

        // Then apply new filters if a project is selected
        if (frappe.project_selector.current_project) {
            await this.apply_current_filters();
        }
    }

    async clear_all_filters() {
        const route = frappe.get_route();
        if (!route || !route.length) return;

        const route_type = route[0];
        const doctype = route[1];

        if (route_type === 'List') {
            const list_view = cur_list;
            if (list_view && list_view.filter_area) {
                list_view.filter_area.clear();
                await list_view.refresh();
            }
        }
    }

    async apply_filters_on_route_change() {
        const route = frappe.get_route();
        if (!route || !route.length) return;

        const route_type = route[0];
        const doctype = route[1];

        if (!doctype) return;

        const project_fields = await this.get_project_link_fields(doctype);
        if (!project_fields.length) return;

        if (route_type === 'List') {
            await this.apply_list_filters(doctype, project_fields);
        } else if (route_type === 'Form' && route[2] === 'new') {
            this.apply_form_defaults(doctype, project_fields);
        }
    }

    async apply_current_filters() {
        const route = frappe.get_route();
        if (!route || route[0] !== 'List') return;

        const doctype = route[1];
        if (!doctype) return;

        const project_fields = await this.get_project_link_fields(doctype);
        if (!project_fields.length) return;

        await this.apply_list_filters(doctype, project_fields);
    }

    async apply_list_filters(doctype, project_fields) {
        const list_view = cur_list;
        if (!list_view || !list_view.filter_area) return;

        try {
            // Apply project filters
            project_fields.forEach(field => {
                list_view.filter_area.add([
                    [doctype, field, '=', frappe.project_selector.current_project]
                ]);
            });

            // Refresh list view
            await list_view.refresh();
        } catch (error) {
            console.error('Error applying list filters:', error);
        }
    }

    apply_form_defaults(doctype, project_fields) {
        if (!frappe.project_selector.current_project) return;

        frappe.ui.form.on(doctype, {
            setup: function(frm) {
                project_fields.forEach(field => {
                    if (!frm.doc[field]) {
                        frm.set_value(field, frappe.project_selector.current_project);
                    }
                });
            }
        });
    }

    async load_projects() {
        try {
            const projects = await frappe.db.get_list('Project', {
                fields: ['name', 'project_name'],
                filters: { status: 'Open' },
                limit: 0
            });

            this.render_project_list(projects);
        } catch (error) {
            console.error('Error loading projects:', error);
            frappe.show_alert({
                message: __('Error loading projects. Please refresh the page.'),
                indicator: 'red'
            });
        }
    }

    render_project_list(projects) {
        let html = `<li><a href="#" data-project="">All Projects</a></li>`;
        
        projects.forEach(project => {
            html += `
                <li>
                    <a href="#" data-project="${project.name}">
                        ${frappe.utils.escape_html(project.project_name || project.name)}
                    </a>
                </li>
            `;
        });

        this.$project_list.html(html);
    }

    async set_project(project, refresh = true) {
        // Clear all existing filters first
        await this.clear_all_filters();

        // Set the new project
        frappe.project_selector.current_project = project;
        
        // Update label
        this.$project_label.text(project || 'Select Project');
        
        // Store in localStorage
        localStorage.setItem('selected_project', project || '');
        
        // Apply new filters if needed and not on home page
        if (refresh && frappe.get_route()[0] !== 'Workspaces') {
            await this.apply_filters_on_route_change();
        }

        // Show indicator
        if (project) {
            frappe.show_alert({
                message: __('Project filtered: {0}', [project]),
                indicator: 'blue'
            });
        } else {
            frappe.show_alert({
                message: __('All projects shown'),
                indicator: 'blue'
            });
        }
    }
}

// Initialize project selector
$(document).ready(function() {
    frappe.project_selector.instance = new frappe.project_selector.ProjectSelector();
});

