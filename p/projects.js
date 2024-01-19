
import ProjectsList from './metadata.js';

const tags = {
    "game": "Games",
    "fullgame": "Full Games",
    "gamejam": "Jam Games",
    "classproject": "Class Projects",
    "misc": "Miscellaneous",
    "old": "Achived Projects",
};

const uri = new URL(window.location.href);
const filterQueryParam = uri.searchParams.get('f')?.split(',');

const filters = filterQueryParam ? filterQueryParam : Object.keys(tags);

const projects = filters.length != Object.keys(tags).length ? ProjectsList.filter(project => {
    if (!project.tags) { return false; }
    
    for (const filter of filters) {
        if (project.tags.includes(filter)) { return true; }
    }
    return false;
}) : ProjectsList;

const projectGroups = {};

for (const project of projects) {
    if (!project.tags) { continue; }

    const filteredTags = project.tags.filter(tag => filters.includes(tag));
    if (filteredTags.length == 0) { continue; }

    const primaryTag = filteredTags[0];
    if (!projectGroups[primaryTag]) { projectGroups[primaryTag] = []; }
    projectGroups[primaryTag].push(project);
}

for (const tag of Object.keys(projectGroups)) {
    // sort
    projectGroups[tag].sort((a, b) => {
        const aDate = a.date instanceof Date ? a.date : new Date(a.date);
        const bDate = b.date instanceof Date ? b.date : new Date(b.date);
        return bDate - aDate;
    });
}

const projectListContainer = document.getElementById('project-list-container');
const renderProjectGroup = Object.keys(projectGroups).map(tag => {
    const projects = projectGroups[tag];
    const projectHTML = (project) => {
        let dateStr = "";
        if (project.date) {
            if (project.date instanceof Date) {
                if (project.date.getTime() % 24*60*60*1000 == 0) {
                    dateStr = project.date.toLocaleDateString();
                } else {
                    dateStr = project.date.toLocaleString();
                }
            } else {
                dateStr = project.date;
            }
        }

        let links = [];
        let title = project.title;
        if (project.links) {
            if (project.links.link) {
                title = `<a href="${project.links.link}">${title}</a>`;
            }
            const listedLinks = Object.keys(project.links).filter(ltext => ltext != 'link');
            links = listedLinks.map((ltext) => `<p>${ltext}:&emsp;<a href="${project.links[ltext]}">${project.links[ltext]}</a></p>`);
        }
        return /* html */`
        <tr>
            <td class="project-info">
                <h2>${title}</h2>
                <p style="margin-top: 0"><small>${dateStr} - ${project.tags.map(t => tags[t]).join(", ")}</small><p>
                <p>${project.desc}</p>
                
                ${links.join("\n")}
            </td>
            <td>
                ${project.img ? '<img class="project-img" src="'+project.img+'" alt="project image">' : ''}
            </td>
        </tr>`;
    };
    
    const groupHTML = /* html */`
    <div>
        <hr>
        <h2>${tags[tag]}</h2>
        <hr>
        <table>
            ${projects.map(project => projectHTML(project)).join("\n")}
        </table>
    </div>
    `;
    return groupHTML;
});

projectListContainer.innerHTML = renderProjectGroup.join("\n");