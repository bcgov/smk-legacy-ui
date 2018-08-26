# SMK Admin UI User Guide - Published Sites
[Back to ToC](https://github.com/bcgov/smk/wiki/SMK-Admin-UI-User-Guide)

When a site is published successfully, it will be displayed in the listing of published sites. Published sites behave the same as sites viewed from the welcome page, but they can no longer be edited.
***
![Published Sites Screen](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_published_screen.jpg)
The published sites screen is similar to the welcome page screen. Published sites contains the same Name, Viewer, and Version columns, but the possible actions are different.

![Published Sites Screen](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_published_screen_actions.jpg)

From a published site, you can perform the following actions:
* Un-Publish
* Export

## Un-Publish
Clicking Un-Publish will delete this published version of your site. This will not delete the current editable version. If you wish to delete a site entirely, you must Un-Publish first, then delete it using the "Delete" action from the welcome page.

## Export
Clicking Export will generate a zip file containing your sites Map Configuration, all attachments (vector layers will be exported as GeoJSON), and the current code for the SMK Client Viewer. 