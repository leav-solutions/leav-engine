import{u as s,r as e,j as r}from"./useTranslation-e596755c.js";import{ad as o}from"./RecordCard-cc8b414d.js";import{a8 as t}from"./utils-e6894fde.js";import{u as a,a as i,I as n,s as l,L as p,T as m}from"./index-ba602e11.js";import{s as d}from"./styled-components.browser.esm-f2eded25.js";import{A as u}from"./index-275ce878.js";import"./ImportReducerContext-32a848c6.js";import"./index-39382eca.js";import"./progress-1d8d10a8.js";const c=d.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding-bottom: 1rem;

    > * {
        flex-grow: 1;
    }
`;function f(){var d,f;const{t:j}=s(),{lang:x}=o(),g=a(),b=i();return e.useEffect((()=>{const s={content:j("info.base-message",{appLabel:`${b.globalSettings.name} - ${t(b.currentApp.label,x)}`,interpolation:{escapeValue:!1}}),type:n.basic};g(l(s))}),[j,g]),null===(null==(d=null==b?void 0:b.currentApp)?void 0:d.libraries)&&null===(null==(f=null==b?void 0:b.currentApp)?void 0:f.trees)?r.jsx(u,{style:{margin:"1rem"},message:j("home.no_libraries_or_trees"),type:"info",showIcon:!0}):r.jsxs(c,{children:[r.jsx(p,{}),r.jsx(m,{})]})}export{f as default};
