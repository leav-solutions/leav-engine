"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORM_ROOT_CONTAINER_ID = exports.TabsDirection = exports.FormFieldTypes = exports.FormUIElementTypes = void 0;
var FormUIElementTypes;
(function (FormUIElementTypes) {
    FormUIElementTypes["DIVIDER"] = "divider";
    FormUIElementTypes["FIELDS_CONTAINER"] = "fields_container";
    FormUIElementTypes["TAB_FIELDS_CONTAINER"] = "tab_fields_container";
    FormUIElementTypes["TEXT_BLOCK"] = "text_block";
    FormUIElementTypes["TABS"] = "tabs";
})(FormUIElementTypes = exports.FormUIElementTypes || (exports.FormUIElementTypes = {}));
var FormFieldTypes;
(function (FormFieldTypes) {
    FormFieldTypes["TEXT_INPUT"] = "input_field";
    FormFieldTypes["DATE"] = "date";
    FormFieldTypes["CHECKBOX"] = "checkbox";
    FormFieldTypes["ENCRYPTED"] = "encrypted";
    FormFieldTypes["DROPDOWN"] = "dropdown";
    FormFieldTypes["LINK"] = "link";
    FormFieldTypes["TREE"] = "tree";
})(FormFieldTypes = exports.FormFieldTypes || (exports.FormFieldTypes = {}));
var TabsDirection;
(function (TabsDirection) {
    TabsDirection["HORIZONTAL"] = "horizontal";
    TabsDirection["VERTICAL"] = "vertical";
})(TabsDirection = exports.TabsDirection || (exports.TabsDirection = {}));
exports.FORM_ROOT_CONTAINER_ID = '__root';
//# sourceMappingURL=forms.js.map