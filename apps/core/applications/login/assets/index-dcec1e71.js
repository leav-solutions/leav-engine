import{j as e,g as r,s as t,S as o,R as i,C as n,a,F as s,b as l,P as d,r as c,c as m,u,d as g,I as p,A as h,e as f,f as w,B as y,h as b,i as v,U as x,L as $,N as I,k as S,l as E,m as P,n as _,o as C,p as T,q as k,t as A,v as N,w as R,x as O}from"./vendor-cf9f48f5.js";!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver((e=>{for(const t of e)if("childList"===t.type)for(const e of t.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&r(e)})).observe(document,{childList:!0,subtree:!0})}function r(e){if(e.ep)return;e.ep=!0;const r=function(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerpolicy&&(r.referrerPolicy=e.referrerpolicy),"use-credentials"===e.crossorigin?r.credentials="include":"anonymous"===e.crossorigin?r.credentials="omit":r.credentials="same-origin",r}(e);fetch(e.href,r)}}();const L=e.jsx,B=e.jsxs,D="#000000",z={primaryColor:"#0f97e4",defaultBg:"#ffffff",invertedDefaultBg:"#000000",defaultTextColor:D,invertedDefaultTextColor:"#ffffff",secondaryTextColor:D+"80",activeColor:"#def4ff",errorColor:"#e02020",secondaryBg:"#f0f0f0",lightBg:"#fafafa",headerBg:"#f4f4f4",borderColor:"#d9d9d9",borderLightColor:"rgb(240, 240, 240)",headerHeight:"3rem",navigationColumnWidth:"20rem",inheritedValuesVersionColor:"#FFBA00",checkerBoard:"repeating-conic-gradient(rgb(220,220,220) 0% 25%, rgb(240,240,240) 0% 50%) 50% / 20px 20px",imageDefaultBackground:"rgb(245, 245, 245)"},F={token:{colorPrimary:z.primaryColor,colorError:z.errorColor,colorBgBase:z.defaultBg,colorTextBase:z.defaultTextColor,colorBorder:z.borderColor,colorBorderSecondary:z.borderLightColor,colorSplit:z.borderColor,wireframe:!1},components:{Layout:{colorBgHeader:z.secondaryBg,controlHeight:24},Dropdown:{controlItemBgHover:z.activeColor,colorSplit:z.borderLightColor},Menu:{colorActiveBarBorderSize:0},Table:{colorBgContainer:"transparent",colorFillAlter:z.lightBg}}},j=r`
    fragment RecordIdentity on Record {
        id
        whoAmI {
            id
            label
            color
            library {
                id
                label
            }
            preview {
                tiny
                small
                medium
                big
                huge
            }
        }
    }
`,q=r`
    fragment ApplicationDetails on Application {
        id
        label
        type
        description
        endpoint
        url
        color
        icon {
            ...RecordIdentity
        }
        module
        libraries {
            id
        }
        trees {
            id
        }
        permissions {
            access_application
            admin_application
        }
        install {
            status
            lastCallResult
        }
        settings
    }
    ${j}
`;var H,M,V,U,G,K,W,X,J,Y;r`
    query CHECK_APPLICATION_EXISTENCE($id: ID, $endpoint: String) {
        applications(filters: {id: $id, endpoint: $endpoint}) {
            totalCount
        }
    }
`,r`
    query GET_APPLICATION_BY_ID($id: ID!) {
        applications(filters: {id: $id}) {
            list {
                ...ApplicationDetails
            }
        }
    }
    ${q}
`,r`
    query GET_APPLICATION_MODULES {
        applicationsModules {
            id
            description
            version
        }
    }
`,r`
    mutation INSTALL_APPLICATION($id: ID!) {
        installApplication(id: $id)
    }
`,r`
    mutation SAVE_APPLICATION($application: ApplicationInput!) {
        saveApplication(application: $application) {
            ...ApplicationDetails
        }
    }
    ${q}
`,r`
    query USER_INFO($type: PermissionTypes!, $actions: [PermissionsActions!]!) {
        me {
            login
            ...RecordIdentity
        }
        permissions: isAllowed(type: $type, actions: $actions) {
            name
            allowed
        }
    }
    ${j}
`,t(o)`
    && {
        display: block;
        margin: ${e=>e.compact?"1em":"3em"};
    }
`,i.createContext(null),(M=H||(H={})).VALIDATION_ERROR="VALIDATION_ERROR",M.PERMISSION_ERROR="PERMISSION_ERROR",M.INTERNAL_ERROR="INTERNAL_ERROR",(U=V||(V={})).IMAGE="image",U.VIDEO="video",U.AUDIO="audio",U.DOCUMENT="document",U.OTHER="other",(K=G||(G={})).DIVIDER="divider",K.FIELDS_CONTAINER="fields_container",K.TAB_FIELDS_CONTAINER="tab_fields_container",K.TEXT_BLOCK="text_block",K.TABS="tabs",(X=W||(W={})).TEXT_INPUT="input_field",X.DATE="date",X.CHECKBOX="checkbox",X.ENCRYPTED="encrypted",X.DROPDOWN="dropdown",X.LINK="link",X.TREE="tree",(Y=J||(J={})).HORIZONTAL="horizontal",Y.VERTICAL="vertical";const Z=(e="",r="hsl",t=30,o=80)=>{let i=0;for(let a=0;a<e.length;a++)i=e.charCodeAt(a)+((i<<5)-i);const n=i%360;switch(r){case"hex":return ee(n,t,o);case"rgb":const[e,r,i]=re(n,t,o);return`rgb(${e},${r},${i})`;default:return`hsl(${n}, ${t}%, ${o}%)`}},Q=(e,r,t)=>(t<0&&(t+=1),t>1&&(t-=1),t<1/6?e+6*(r-e)*t:t<.5?r:t<2/3?e+(r-e)*(2/3-t)*6:e),ee=(e,r,t)=>{const[o,i,n]=re(e,r,t),a=e=>{const r=e.toString(16);return 1===r.length?"0"+r:r};return`#${a(o)}${a(i)}${a(n)}`},re=(e,r,t)=>{let o,i,n;if(e/=360,t/=100,0===(r/=100))o=i=n=t;else{const a=t<.5?t*(1+r):t+r-t*r,s=2*t-a;o=Q(s,a,e+1/3),i=Q(s,a,e),n=Q(s,a,e-1/3)}return[Math.round(255*o),Math.round(255*i),Math.round(255*n)]},te=e=>{const r=e.replace(/#/g,"");return(299*parseInt(r.substr(0,2),16)+587*parseInt(r.substr(2,2),16)+114*parseInt(r.substr(4,2),16))/1e3>=128?"#000000":"#FFFFFF"},oe=(e,r=2)=>{if("string"!=typeof e)return"?";const t=e.split(" ").slice(0,r);return(t.length>=r?t.map((e=>e[0])).join(""):t[0].slice(0,r)).toUpperCase()};t.fieldset`
    border-radius: ${e=>e.themeToken.borderRadius}px;
    border: 1px solid ${e=>e.themeToken.colorBorderSecondary};
    padding: ${e=>e.themeToken.padding}px ${e=>e.themeToken.padding/2}px;
    margin-bottom: ${e=>e.themeToken.padding}px;

    legend {
        border: none;
        padding: 0 0.5rem;
        margin: 0 0 0 5%;
        font-size: 1em;
        color: ${e=>e.themeToken.colorTextSecondary};
        width: auto;
    }
`;t(n)`
    animation: appear 500ms, ${350}ms disappear ${2650}ms;
    color: ${e=>{var r,t;return(null==(t=null==(r=e.theme)?void 0:r.antd)?void 0:t.colorSuccess)??"inherit"}};

    @keyframes disappear {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(5);
        }
    }

    @keyframes appear {
        from {
            opacity: 0;
            transform: scale(5);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`,t(a)`
    color: ${e=>{var r,t;return(null==(t=null==(r=e.theme)?void 0:r.antd)?void 0:t.colorError)??"inherit"}};
`,t.div`
    font-weight: bold;
`,t.div`
    color: ${z.secondaryTextColor};
`,t(s.Item)`
    .ant-form-item-extra {
        min-height: 0;
    }
`,t.div`
    text-align: center;
    margin: 1rem;
`,t.div`
    overflow: auto;
    white-space: pre;
    font-family: monospace;
    font-size: 0.9em;
    background-color: ${z.invertedDefaultBg};
    color: ${z.invertedDefaultTextColor};
    padding: 0.5rem;
    border-radius: ${e=>{var r,t;return(null==(t=null==(r=e.theme)?void 0:r.antd)?void 0:t.borderRadius)??5}}px;
`,t.div`
    ${e=>e.$style}
`;const ie=t(l.Image)`
    &&& {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;

        .ant-skeleton-image-svg {
            width: 30%;
            height: 30%;
        }
    }
`;function ne({style:e}){return L(ie,{style:{...e},className:"ant-skeleton-active"})}const ae=t.div`
    &&& {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
    }
`;function se({style:e}){return L(ae,{children:L(d,{style:{display:"flex",justifyContent:"center",fontSize:e.height?`calc(${e.height} * 0.6)`:"120px",color:z.secondaryTextColor,...e}})})}var le=(e=>(e.tiny="tiny",e.small="small",e.medium="medium",e.big="big",e))(le||{});const de=(e,r=!1)=>{if(r)return"1.2rem";switch(e){case le.medium:return"3.5rem";case le.big:return"6rem";case le.small:return"2.5rem";case le.tiny:return"1.7rem";default:return"2rem"}},ce=t.div`
    border-radius: 50%;
    border: 1px solid ${z.borderColor};
    width: calc(${de(null,!0)} + 0.5rem);
    height: calc(${de(null,!0)} + 0.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
`;function me({label:e}){const r=oe(e,1);return L(ce,{"data-testid":"simplistic-preview",children:r})}const ue=t.div`
    ${e=>e.style||""}
    background-color: ${e=>e.bgColor};
    color: ${e=>e.fontColor};
    font-size: ${({size:e})=>`calc(${de(e)} / 2.5)`};
    height: ${({size:e})=>de(e)};
    width: ${({size:e})=>de(e)};
    padding: 5px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 50%;
`;ue.displayName="GeneratedPreview";const ge=t.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${({size:e})=>de(e)};
    width: ${({size:e})=>de(e)};
    overflow: hidden;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
`;ge.displayName="ImagePreview";const pe=t.img`
    display: ${e=>e.$loaded?"block":"none"};
`;function he({label:e,color:r,image:t,size:o,style:i,simplistic:n=!1}){const[a,s]=c.useState(!1);if(n)return L(me,{label:e});if(t)return B(ge,{size:o,style:i,children:[!a&&L(l.Image,{style:{width:"65%",height:"65%",background:"none",margin:"auto"}}),L(pe,{$loaded:a,src:t,alt:"record preview",onLoad:()=>s(!0),style:{maxHeight:"auto",maxWidth:"auto",width:"100%",height:"100%",objectFit:"cover",...i}})]});const d=r||Z(e),m=te(d);return L(ue,{"data-testid":"generated-preview",className:"initial",bgColor:d,fontColor:m,size:o,style:{...i},children:oe(e)})}const fe=t.div`
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: 0.25rem 0.25rem 0 0;
    width: fit-content;
    height: fit-content;
    margin: auto;
    background: ${z.imageDefaultBackground};

    && img {
        max-width: 100%;
        max-height: 100%;
        border-radius: 0;
    }
`;fe.displayName="ImagePreviewTile";const we=t.img`
    display: ${e=>e.$loaded?"block":"none"};
    border: 1px solid ${z.borderColor};
`,ye=t.div`
    ${e=>e.style||""}
    background-color: ${e=>e.bgColor};
    color: ${e=>e.fontColor};
    font-size: 4em;
    padding: 5px;
    height: 10rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 0.25rem 0.25rem 0 0;
`;function be({label:e,color:r,image:t,style:o,imageStyle:i,placeholderStyle:n}){const[a,s]=c.useState(!1),[l,d]=c.useState(!1);if(t)return B(fe,{style:{position:"relative",...o},children:[" ",!a&&L(ne,{}),l?L(se,{style:{...o}}):L(we,{$loaded:a,src:t,alt:"record preview",style:{...i},onLoad:()=>s(!0),onError:()=>{s(!0),d(!0)}})]});const m=r||Z(e),u=te(m);return L(ye,{"data-testid":"generated-preview",className:"initial",bgColor:m,fontColor:u,style:n,children:oe(e)})}ye.displayName="GeneratedPreviewTile",i.memo((function(e){return e.tile?L(be,{...e}):L(he,{...e})}));const ve={[le.tiny]:"0.3rem",[le.small]:"0.5rem",[le.medium]:"0.8rem",[le.big]:"0.8rem"};t.div`
    border-left: 5px solid ${e=>e.recordColor||"transparent"};
    display: grid;
    grid-template-areas: ${e=>{return r=e.withPreview,t=e.withLibrary,e.tile?r?t?"\n                    'preview'\n                    'label'\n                    'sub-label'\n                ":"\n                'preview'\n                'label'\n            ":t?"\n                'label'\n                'sub-label'\n            ":"'label'":r?t?"\n                    'preview label'\n                    'preview sub-label'\n                ":"\n                'preview label'\n            ":t?"\n                'label'\n                'sub-label'\n            ":"'label'";var r,t}};}};

    grid-template-columns:
        ${e=>{if(!e.withPreview||e.tile)return"100%";const r=`calc(${de(e.size,(null==e?void 0:e.simplistic)??!1)} + calc(2*${ve[e.size]}))`;return`${r} calc(100% - ${r})`}}
`.displayName="Wrapper",t.div`
    grid-area: preview;
    margin: ${e=>e.tile?"0.3rem 0":`0 ${ve[e.size]}`};
    justify-self: center;
`,t.div`
    grid-area: label;
    font-weight: bold;
    overflow: hidden;
    align-self: ${e=>e.simplistic||!e.withLibrary?"center":"end"};
    line-height: 1.3em;
`,t.div`
    grid-area: sub-label;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.4);
    font-size: 0.9em;
    line-height: 1.3em;
`;const xe=t.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 10%;
`,$e=t(m)`
    width: 30rem;
    max-width: 450px;
    box-sizing: border-box;
`,Ie=({onSubmit:e,loading:r,forgotPasswordError:t,forgotPasswordSuccess:i})=>{const{t:a}=u(),[l,d]=c.useState(""),m=g();return L(xe,{children:B($e,{title:L("img",{src:"/global-icon/small",height:"100px"}),headStyle:{textAlign:"center",padding:"1rem"},style:{width:"30rem"},children:[L("h3",{children:a("forgotPassword.header")}),B(s,{onFinish:async()=>{e(l)},children:[L(s.Item,{hasFeedback:!0,name:"email",rules:[{type:"email",message:a("forgotPassword.email_not_valid")},{required:!0,message:a("forgotPassword.email_required")}],children:L(p,{"aria-label":a("forgotPassword.email"),placeholder:a("forgotPassword.email"),autoFocus:!0,value:l,onChange:(v=d,e=>{v(e.target.value)})})}),r&&L(s.Item,{children:L(h,{message:a("forgotPassword.loading.header"),description:a("forgotPassword.loading.text"),icon:L(o,{}),type:"warning",showIcon:!0})}),t&&L(s.Item,{children:L(h,{message:t,type:"error",showIcon:!0,icon:L(f,{style:{fontSize:"1.5em"}})})}),i&&L(s.Item,{children:L(h,{message:i,type:"success",showIcon:!0,icon:L(n,{style:{fontSize:"1.5em"}})})}),!r&&B(w,{wrap:!0,style:{float:"right"},direction:"horizontal",children:[L(s.Item,{children:L(y,{onClick:()=>{m.push("/")},type:"default",block:!0,children:a("forgotPassword.cancel")})}),L(s.Item,{children:L(y,{type:"primary",htmlType:"submit",icon:L(b,{}),block:!0,children:a("forgotPassword.submit")})})]})]})]})});var v},Se=window.location.pathname.split("/").filter((e=>e))[1],Ee=()=>{const{t:e}=u(),[r,t]=c.useState(!1),[o,i]=c.useState(""),[n,a]=c.useState("");return L(Ie,{onSubmit:async r=>{try{t(!0),i(""),a("");const o=await fetch("/auth/forgot-password",{method:"POST",headers:new Headers([["Content-Type","application/json"]]),body:JSON.stringify({email:r,lang:v.language})});if(400===o.status)throw new Error(e("error.missing_parameters"));if(401===o.status)throw new Error(e("forgotPassword.error.user_not_found"));if(200===o.status&&a(e("forgotPassword.success")),!o.ok)throw new Error(e("error.no_server_response"))}catch(o){let r=o.message;o.message.indexOf("NetworkError")>-1&&(r=e("error.no_server_response")),i(r)}finally{t(!1)}},loading:r,forgotPasswordError:o,forgotPasswordSuccess:n})},Pe=e=>r=>{e(r.target.value)},_e=t.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 10%;
`,Ce=t(m)`
    width: 30rem;
    max-width: 450px;
    box-sizing: border-box;
`,Te=({onSubmit:e,loading:r,loginError:t})=>{const{t:i}=u(),[n,a]=c.useState(""),[l,d]=c.useState("");return L(_e,{children:L(Ce,{title:L("img",{src:"/global-icon/small",height:"100px"}),headStyle:{textAlign:"center",padding:"1rem"},children:B(s,{onFinish:async()=>{e(n,l)},children:[L(s.Item,{children:L(p,{prefix:L(x,{}),type:"text",name:"login","aria-label":i("login.login"),placeholder:i("login.login"),autoFocus:!0,value:n,onChange:Pe(a)})}),L(s.Item,{children:L(p,{prefix:L($,{}),type:"password",name:"password","aria-label":i("login.password"),placeholder:i("login.password"),value:l,onChange:Pe(d)})}),r&&L(s.Item,{children:L(h,{message:i("login.loading.header"),description:i("login.loading.text"),icon:L(o,{}),type:"warning",showIcon:!0})}),t&&L(s.Item,{children:L(h,{message:t,type:"error",showIcon:!0,icon:L(f,{style:{fontSize:"1.5em"}})})}),!r&&L(s.Item,{children:L(y,{size:"large",type:"primary",loading:r,disabled:r,htmlType:"submit",block:!0,children:i("login.submit")})}),L(s.Item,{children:L(I,{style:{float:"right"},to:"/forgot-password",children:i("login.forgot_password")})})]})})})},ke=()=>{const e=S(),{t:r}=u(),[t,o]=c.useState(!1),[i,n]=c.useState(""),a=e.dest??"/";return L(Te,{onSubmit:async(e,t)=>{try{o(!0),n("");const i=await fetch("/auth/authenticate",{method:"POST",headers:new Headers([["Content-Type","application/json"]]),body:JSON.stringify({login:e,password:t})});if(401===i.status)throw new Error(r("login.error.bad_credentials"));if(!i.ok)throw new Error(r("error.no_server_response"));window.location.replace(a)}catch(i){let e=i.message;i.message.indexOf("NetworkError")>-1&&(e=r("error.no_server_response")),n(e)}finally{o(!1)}},loading:t,loginError:i})},Ae=e=>r=>{e(r.target.value)},Ne=t.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 10%;
`,Re=t(m)`
    width: 30rem;
    max-width: 450px;
    box-sizing: border-box;
`,Oe=({onSubmit:e,loading:r,resetPasswordError:t})=>{const{t:i}=u(),[n,a]=c.useState(""),[l,d]=c.useState("");return L(Ne,{children:B(Re,{title:L("img",{src:"/global-icon/small",height:"100px"}),headStyle:{textAlign:"center",padding:"1rem"},style:{width:"30rem"},children:[B("h3",{children:[" ",i("resetPassword.header")]}),B(s,{onFinish:async()=>{e(n)},children:[L(s.Item,{hasFeedback:!0,name:"newPassword",rules:[{required:!0,message:i("resetPassword.new_password_required")}],children:L(p.Password,{"aria-label":i("resetPassword.new_password"),placeholder:i("resetPassword.new_password"),autoFocus:!0,value:n,onChange:Ae(a)})}),L(s.Item,{name:"confirmPassword",dependencies:["newPassword"],hasFeedback:!0,rules:[{required:!0,message:i("resetPassword.confirm_password_required")},({getFieldValue:e})=>({validator:(r,t)=>t&&e("newPassword")!==t?Promise.reject(new Error(i("resetPassword.wrong_confirm_password"))):Promise.resolve()})],children:L(p.Password,{"aria-label":i("resetPassword.confirm_password"),placeholder:i("resetPassword.confirm_password"),value:l,onChange:Ae(d)})}),r&&L(s.Item,{children:L(h,{message:i("resetPassword.loading.header"),description:i("resetPassword.loading.text"),icon:L(o,{}),type:"warning",showIcon:!0})}),t&&L(s.Item,{children:L(h,{message:t,type:"error",showIcon:!0,icon:L(f,{style:{fontSize:"1.5em"}})})}),!r&&L(s.Item,{children:L(y,{size:"large",type:"primary",loading:r,disabled:r,htmlType:"submit",block:!0,children:i("resetPassword.submit")})})]})]})})},Le=()=>{const{t:e}=u(),[r,t]=c.useState(!1),[o,i]=c.useState(""),{token:n}=S();return L(Oe,{onSubmit:async r=>{try{t(!0),i("");const o=await fetch("/auth/reset-password",{method:"POST",headers:new Headers([["Content-Type","application/json"]]),body:JSON.stringify({token:n,newPassword:r})});if(400===o.status)throw new Error(e("error.missing_parameters"));if(401===o.status)throw new Error(e("resetPassword.error.invalid_token"));if(422===o.status)throw new Error(e("resetPassword.error.invalid_password"));if(!o.ok)throw new Error(e("error.no_server_response"));window.location.replace("/")}catch(o){let r=o.message;o.message.indexOf("NetworkError")>-1&&(r=e("error.no_server_response")),i(r)}finally{t(!1)}},loading:r,resetPasswordError:o})},Be=t(o)`
    && {
        display: block;
        margin: 3em;
    }
`;function De(){return L(Be,{})}function ze({message:e,actionButton:r}){const{t:t}=u(),o={title:t("error.error_occurred"),icon:L(E,{color:"red"}),message:"",actionButton:null};return L(P,{title:o.title,subTitle:e??o.message,status:"error",icon:o.icon,extra:r??o.actionButton})}function Fe(){const[e,r]=c.useState(!0),[t,o]=c.useState(),[i,n]=c.useState("");return c.useEffect((()=>{(async()=>{try{const e=await fetch("/global-name",{method:"GET"}),t=await e.text();n(t)}catch(e){o(String(e))}finally{r(!1)}})()}),[]),{name:i,error:t,loading:e}}const je=t.div`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #8051fc;
`;function qe(){const{name:e,loading:r,error:t}=Fe();return c.useEffect((()=>{document.title=`${e}`}),[e]),t?L(ze,{message:t}):r?L(De,{}):L(je,{children:L(_,{basename:`app/${Se}`,children:B(C,{children:[L(T,{exact:!0,path:"/",children:L(ke,{})}),L(T,{path:"/reset-password/:token",children:L(Le,{})}),L(T,{path:"/forgot-password",children:L(Ee,{})})]})})})}const He={},Me=(e,r)=>{v.use(k).use(A).use(N).init({fallbackLng:r,ns:["translations"],defaultNS:"translations",backend:{loadPath:`/${e}/locales/{{lng}}/{{ns}}.json`},react:{useSuspense:!0}})};function Ve(){const[e,r]=c.useState(!0),[t,o]=c.useState(),[i,n]=c.useState("");return c.useEffect((()=>{(async()=>{try{const e=await fetch("/global-lang",{method:"GET"}),t=await e.text();n(t)}catch(e){o(String(e))}finally{r(!1)}})()}),[]),{lang:i,error:t,loading:e}}function Ue(){const{lang:e,loading:r,error:t}=Ve(),[o,n]=c.useState(!1);return c.useEffect((()=>{!o&&e&&(Me(`app/${Se}`,e),n(!0))}),[e]),t?L(ze,{message:t}):r?L(De,{}):o&&L(i.StrictMode,{children:L(O,{theme:F,children:L(qe,{})})})}var Ge;R.createRoot(document.getElementById("root")).render(L(Ue,{})),Ge&&Ge instanceof Function&&function(e,r,t){if(!r||0===r.length)return e();const o=document.getElementsByTagName("link");return Promise.all(r.map((e=>{if((e=function(e){return window.__dynamic_base__+"/"+e}(e))in He)return;He[e]=!0;const r=e.endsWith(".css"),i=r?'[rel="stylesheet"]':"";if(t)for(let t=o.length-1;t>=0;t--){const i=o[t];if(i.href===e&&(!r||"stylesheet"===i.rel))return}else if(document.querySelector(`link[href="${e}"]${i}`))return;const n=document.createElement("link");return n.rel=r?"stylesheet":"modulepreload",r||(n.as="script",n.crossOrigin=""),n.href=e,document.head.appendChild(n),r?new Promise(((r,t)=>{n.addEventListener("load",r),n.addEventListener("error",(()=>t(new Error(`Unable to preload CSS for ${e}`))))})):void 0}))).then((()=>e()))}((()=>import("./web-vitals-6de2ccaf.js")),[]).then((({getCLS:e,getFID:r,getFCP:t,getLCP:o,getTTFB:i})=>{e(Ge),r(Ge),t(Ge),o(Ge),i(Ge)}));
