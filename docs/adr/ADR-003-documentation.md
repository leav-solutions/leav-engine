# Documentation

Date: 01/04/2026

## Context:

Currently technical documentation in confluence is often out of date, not well known or simply not written.\
For new developers on project, they do not know where to find technical information needed to start a project, and missing some answers to known issues.

Also we do not track updates made to application/codebase and information to help guide developers.

## Questions:

- Should we add documentation for each project (repository)?
- What do we add as documentation to avoid having duplicates with confluence?
- How to update correctly the documentation?
- Which format is better suited to write in?
- Do we need a visualization tool?
- Is it needed to be accessible for non-technical people?
- Do we need AI tools for better usage? (search?)

## Decisions:

- **Should we add documentation for each project (repository)?**

Documentation will be added in docs/ folder at root for each repository, with sub folders to organize based on projects in repository.\
To track documentation for all projects, in each README.md, a link to the correct documentation space will be added in docs/ folder. README.md files should only be used as an entry point to the docs folder

A suggested scaffolding:

```
docs/
  architecture/
    ADR/
    ...
  project/
    admin/
    app-studio/
    core/
    ...
  troubleshooting/
    ...
  guides/
    deployment
    commit-convention
    code-styling
    ...
```

- **What do we add as documentation to avoid having duplicates with confluence?**

If documentation content needs an update if code is updated, then documentation should not be in confluence, but close to the code
Technical documentation specifically should be added close to the code.
To keep a single source of truth, it is important to respect a strict rule:

Code related should be in repository only\
Process/business/onboarding should be in confluence.

- **How to update/create correctly the documentation?**

If the code/configuration/tests are updated, the related documentation should be updated at the same time in a common merge request. Ideally with a specific commit with `docs` as the conventional commit type.\
If the documentation to create does not concern a code change (like a guide page), a specific MR should be needed to review it on its own.

_Each team is responsible for maintaining the documentation of their repositories._

- **Which format is better suited to write in?**

Markdown `md` is easy to write, and can be read correctly on its own (without a visualization tool)

- **Do we need a visualization tool?**

It is recommended but not blocking. As the format is Markdown, the visualization tool should only be a "bonus" to view documentation.\
Suggestion: Vitepress works perfectly with Markdown format and can auto create menu/layout based existing on folders and files structure (with some plugins). So almost no configuration needed

- **Is it needed to be accessible for non developers?**

Repository documentation is primarily intended for developers, but should remain accessible and understandable for technical people in general.\
Since documentation in repository should only concern technical parts, non-technical people do not need to view documentation. Everyone needs to access confluence for the non-technical documentation

- **Do we need AI tools for better usage? (search?)**

Just like a visualization tool, it is recommended but not blocking and can be added to improve existing documentation.

## Principles

- Documentation should live as close as possible to the code
- Documentation must be updated in the same MR as code changes
- Avoid duplication: each information has a single source of truth

## Actions

Once this ADR is merged (accepted):

- In each repository - Create in docs/ folder a scaffolding based on each project in repository. And move/create content for installation/usage/testing..etc.
- Link in each README.md to the project section in docs/ folder.
- Add a "guide" folder to list various good practice/useful tips to be shared. (migration/deployment/commits convention/code style..etc)
- Install/configure vitepress to visualize documentation.
- Create a habit to ask to update the documentation when needed, through comments in MR reviews.
- Add to Gitlab/GitHub MR template a check for `documentation updated (if needed)` to remind the developer.
