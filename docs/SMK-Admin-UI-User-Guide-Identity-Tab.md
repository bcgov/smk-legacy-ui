# SMK Admin UI User Guide - Identity Tab
[Back to the Config Editor Page](https://github.com/bcgov/smk/wiki/SMK-Admin-UI-User-Guide%3A-Configuration-Editor)

[Back to ToC](https://github.com/bcgov/smk/wiki/SMK-Admin-UI-User-Guide)

The Identity tab allows you to modify the Name, Title, and Viewer type for your site map configuration.

![Config Editor Screen](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_identify.jpg)

## Modify your Name & Title
![Config Editor Screen](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_identify_title.jpg)
To modify your applications Name/ID, simply type your desired name in the text box provided. This Name field is not used for display, but as a unique identifier for your config, so it must be unique. Special characters are not allowed. When you save your configuration, the Name/ID will be parsed. Some special characters will be removed, and spaces will be replaced with dashes. If you do not add a Name/ID value, your Title will be converted into an ID automatically.

The Title field allows you to set what you want to display as your sites Title. This Title will display in your browsers tab header, as well as on the header of the SMK application when in stand-alone mode.

## Select your viewer
![Config Editor Screen](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_identify_viewer.jpg)

To select a viewer, click one of the radio buttons provided. Currently there are two viewer options; Leaflet and ESRI 3D. Each viewer has unique capabilities and some may not be suitable for your needs.

### Leaflet
Leaflet is a light-weight 2D javascript web-mapping framework. From the Leaflet website:

> Leaflet is the leading open-source JavaScript library for mobile-friendly interactive maps. Weighing just about 38 KB of JS, it has all the mapping features most developers ever need.

> Leaflet is designed with simplicity, performance and usability in mind. It works efficiently across all major desktop and mobile platforms, can be extended with lots of plugins, has a beautiful, easy to use and well-documented API and a simple, readable source code that is a joy to contribute to.

You can learn mode about Leaflet by following [this link](https://leafletjs.com/)

### ESRI 3D
ArcGIS API for Javascript allows you to create a site with a 3D viewing option. The ESRI 3D viewer is similar in functionality to the Leaflet viewer, however it does have some current deficiencies and missing features.

Currently ESRI 3D is missing support for:
* Clustering vector features
* Markup tools
* Scale bar
* Key map

But support for these is planned!

You can learn more aboute ArcGIS API for Javascript 3D by following [this link](https://developers.arcgis.com/javascript/latest/guide/index.html)
