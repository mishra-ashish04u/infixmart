exports.id=5980,exports.ids=[5980],exports.modules={6170:(a,b,c)=>{"use strict";c.d(b,{FO:()=>g,P:()=>h,g7:()=>i});var d=c(3498);function e(a,{allowEmpty:b=!1}={}){let c=process.env[a];if(null==c||!b&&""===c)throw Error(`Missing required environment variable: ${a}`);return c}let f=globalThis.__infixmartMysqlPool||(globalThis.__infixmartMysqlPool={pool:null});function g(){return f.pool||(f.pool=d.createPool({host:e("DB_HOST"),port:Number(process.env.DB_PORT||3306),database:e("DB_NAME"),user:e("DB_USER"),password:e("DB_PASSWORD",{allowEmpty:!0}),waitForConnections:!0,connectionLimit:Number(process.env.DB_POOL_LIMIT||10),queueLimit:0,namedPlaceholders:!0,charset:"utf8mb4"})),f.pool}async function h(a,b={}){let[c]=await g().query(a,b);return c}async function i(a,b={}){let[c]=await g().execute(a,b);return c}},17194:(a,b,c)=>{"use strict";c.d(b,{Gs:()=>i,f8:()=>m,kg:()=>l,lC:()=>j,or:()=>k,x8:()=>h});var d=c(6170);let e=`
  id,
  name,
  email,
  password,
  avatar,
  mobile,
  country,
  accessToken,
  refreshToken,
  verify_email,
  last_login_date,
  status,
  otp,
  otp_expires,
  google_id,
  role,
  createdAt,
  updatedAt
`,f=new Set(["name","email","password","avatar","mobile","country","accessToken","refreshToken","verify_email","last_login_date","status","otp","otp_expires","google_id","role"]);function g(a){return a?{...a,_id:a.id,verify_email:!!a.verify_email}:null}function h(a){if(!a)return null;let{password:b,refreshToken:c,otp:d,otp_expires:e,...f}=a;return f}async function i(a){return g((await (0,d.P)(`SELECT ${e} FROM Users WHERE email = :email LIMIT 1`,{email:a}))[0])}async function j(a){return g((await (0,d.P)(`SELECT ${e} FROM Users WHERE id = :id LIMIT 1`,{id:a}))[0])}async function k(a){return g((await (0,d.P)(`SELECT ${e} FROM Users WHERE refreshToken = :refreshToken LIMIT 1`,{refreshToken:a}))[0])}async function l({name:a,email:b,password:c,avatar:e="",mobile:f=null,country:g="",accessToken:h="",refreshToken:i="",verify_email:k=!1,last_login_date:l=null,status:m="active",otp:n=null,otp_expires:o=null,google_id:p=null,role:q="user"}){let r=await (0,d.g7)(`INSERT INTO Users (
      name,
      email,
      password,
      avatar,
      mobile,
      country,
      accessToken,
      refreshToken,
      verify_email,
      last_login_date,
      status,
      otp,
      otp_expires,
      google_id,
      role,
      createdAt,
      updatedAt
    ) VALUES (
      :name,
      :email,
      :password,
      :avatar,
      :mobile,
      :country,
      :accessToken,
      :refreshToken,
      :verify_email,
      :last_login_date,
      :status,
      :otp,
      :otp_expires,
      :google_id,
      :role,
      NOW(),
      NOW()
    )`,{name:a,email:b,password:c,avatar:e,mobile:f,country:g,accessToken:h,refreshToken:i,verify_email:k,last_login_date:l,status:m,otp:n,otp_expires:o,google_id:p,role:q});return j(r.insertId)}async function m(a,b){let c=Object.entries(b).filter(([a,b])=>f.has(a)&&void 0!==b);if(0===c.length)return j(a);let e=c.map(([a])=>`\`${a}\` = :${a}`).join(", "),g=Object.fromEntries(c);return await (0,d.g7)(`UPDATE Users SET ${e}, updatedAt = NOW() WHERE id = :id`,{...g,id:a}),j(a)}},19091:(a,b,c)=>{"use strict";let d;c.d(b,{Z:()=>h});var e=c(21572);let f=Number(process.env.SMTP_PORT||465),g=null!=process.env.SMTP_SECURE?"true"===process.env.SMTP_SECURE:465===f;async function h({to:a,subject:b,text:c="",html:h=""}){await (!d&&(d=e.createTransport({host:process.env.SMTP_HOST,port:f,secure:g,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}})),d).sendMail({from:`"InfixMart" <${process.env.SMTP_FROM||process.env.SMTP_USER}>`,to:a,subject:b,text:c,html:h})}},28337:(a,b,c)=>{"use strict";c.d(b,{bN:()=>p,Qw:()=>s,CF:()=>t,wx:()=>r,vq:()=>v,ZT:()=>q,Y_:()=>w,pU:()=>u});var d=c(7028),e=c(59984),f=c(35984),g=c(19091),h=c(17194),i=c(6170);async function j(){let[a,b,c,d]=await Promise.all([(0,i.P)("SELECT COUNT(*) AS totalOrders FROM Orders"),(0,i.P)("SELECT COUNT(*) AS totalUsers FROM Users"),(0,i.P)("SELECT COUNT(*) AS totalProducts FROM Products"),(0,i.P)("SELECT COALESCE(SUM(totalPrice), 0) AS totalRevenue FROM Orders")]);return{totalOrders:Number(a[0]?.totalOrders||0),totalUsers:Number(b[0]?.totalUsers||0),totalProducts:Number(c[0]?.totalProducts||0),totalRevenue:Number(d[0]?.totalRevenue||0)}}async function k({page:a=1,perPage:b=10,status:c=""}){let d=[],e={limit:b,offset:(a-1)*b};c&&(d.push("o.status = :status"),e.status=c);let f=d.length?`WHERE ${d.join(" AND ")}`:"",[g,h]=await Promise.all([(0,i.P)(`SELECT COUNT(*) AS totalOrders
       FROM Orders o
       ${f}`,e),(0,i.P)(`SELECT
         o.*,
         u.name AS user_name,
         u.email AS user_email
       FROM Orders o
       LEFT JOIN Users u ON u.id = o.userId
       ${f}
       ORDER BY o.createdAt DESC
       LIMIT :limit OFFSET :offset`,e)]),j=Number(g[0]?.totalOrders||0),k=Math.max(1,Math.ceil(j/b));return{orders:h.map(a=>({...a,items:n(a.items,[]),shippingAddress:n(a.shippingAddress,{}),paymentResult:n(a.paymentResult,{}),user:a.user_name||a.user_email?{name:a.user_name,email:a.user_email}:null})),totalOrders:j,totalPages:k,page:a}}async function l({page:a=1,perPage:b=20,search:c=""}){let d=[],e={limit:b,offset:(a-1)*b};c&&(d.push("(name LIKE :search OR email LIKE :search)"),e.search=`%${c}%`);let f=d.length?`WHERE ${d.join(" AND ")}`:"",[g,h]=await Promise.all([(0,i.P)(`SELECT COUNT(*) AS totalUsers
       FROM Users
       ${f}`,e),(0,i.P)(`SELECT
         id,
         name,
         email,
         avatar,
         mobile,
         country,
         verify_email,
         last_login_date,
         status,
         google_id,
         role,
         createdAt,
         updatedAt
       FROM Users
       ${f}
       ORDER BY createdAt DESC
       LIMIT :limit OFFSET :offset`,e)]),j=Number(g[0]?.totalUsers||0),k=Math.max(1,Math.ceil(j/b));return{users:h.map(a=>({...a,_id:a.id,verify_email:!!a.verify_email})),totalUsers:j,totalPages:k,page:a}}async function m(a){let[b,c]=await Promise.all([(0,i.P)(`SELECT COUNT(*) AS orderCount
       FROM Orders
       WHERE userId = :userId`,{userId:a}),(0,i.P)(`SELECT COALESCE(SUM(totalPrice), 0) AS totalSpent
       FROM Orders
       WHERE userId = :userId`,{userId:a})]);return{orderCount:Number(b[0]?.orderCount||0),totalSpent:Number(c[0]?.totalSpent||0)}}function n(a,b){try{return JSON.parse(a||JSON.stringify(b))}catch{return b}}async function o(a){let b=(0,f.Q5)(a),c=(0,f.TL)(a);return await (0,h.f8)(a,{refreshToken:c,last_login_date:new Date}),{accessToken:b,refreshToken:c}}async function p({email:a,password:b}){if(!a||!b)throw new e.j$(400,"Email and password are required");let c=await (0,h.Gs)(String(a).trim().toLowerCase());if(!c)throw new e.j$(401,"Invalid credentials");if("admin"!==c.role)throw new e.j$(403,"Access denied. Admins only.");if("active"!==c.status)throw new e.j$(403,"Account is not active. Contact support.");if(!await d.Ay.compare(String(b),String(c.password||"")))throw new e.j$(401,"Invalid credentials");let f=await o(c.id),g=await (0,h.lC)(c.id);return{body:{message:"Login successful",success:!0,error:!1,data:{user:(0,h.x8)(g)}},tokens:f}}async function q(a){let b=await (0,h.lC)(a);if(!b||"admin"!==b.role)throw new e.j$(403,"Access denied. Admins only.");return b}async function r(){return{...await j(),message:"Dashboard stats fetched successfully",success:!0,error:!1}}async function s({page:a,perPage:b,status:c}){return{...await k({page:a,perPage:b,status:c}),message:"All orders fetched",success:!0,error:!1}}async function t(a){return{...await l(a),message:"Users fetched successfully",success:!0,error:!1}}async function u(a,b){let c=await (0,h.lC)(a);if(!c)throw new e.j$(404,"User not found");if("admin"===c.role)throw new e.j$(403,"Cannot suspend an admin account");let d=b?"active":"Suspended",f=await (0,h.f8)(a,{status:d});return{message:`User ${d}`,user:(0,h.x8)(f),success:!0,error:!1}}async function v(a){return{...await m(a),success:!0,error:!1}}async function w(a){if(!a)throw new e.j$(400,"Provide ?to=your@email.com");return await (0,g.Z)({to:a,subject:"InfixMart SMTP Test",text:"This is a plain-text test email from InfixMart. If you see this, SMTP is working.",html:`<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;padding:32px;background:#f4f6f9;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <h2 style="color:#1565C0;margin-top:0;">InfixMart SMTP Test</h2>
    <p style="color:#333;">This is a test email sent from the InfixMart backend.</p>
    <p style="color:#555;">If you are reading this, your SMTP configuration is working correctly.</p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
    <p style="color:#888;font-size:12px;">
      Sent at: ${new Date().toISOString()}<br/>
      SMTP Host: ${process.env.SMTP_HOST||""}<br/>
      SMTP User: ${process.env.SMTP_USER||""}
    </p>
  </div>
</body></html>`}),{message:`Test email sent to ${a}. Check inbox (and spam folder).`,success:!0,error:!1}}},35984:(a,b,c)=>{"use strict";c.d(b,{$$:()=>j,$Y:()=>h,En:()=>i,Q5:()=>e,TL:()=>f,yE:()=>g});var d=c(48318);function e(a){return d.sign({id:a},process.env.JWT_SECRET_ACCESS_TOKEN,{expiresIn:"15m"})}function f(a){return d.sign({id:a},process.env.JWT_SECRET_REFRESH_TOKEN,{expiresIn:"7d"})}function g(a){return d.sign({email:a,purpose:"password-reset"},process.env.JWT_SECRET||process.env.JWT_SECRET_ACCESS_TOKEN,{expiresIn:"10m"})}function h(a){return d.verify(a,process.env.JWT_SECRET_ACCESS_TOKEN)}function i(a){return d.verify(a,process.env.JWT_SECRET_REFRESH_TOKEN)}function j(a){return d.verify(a,process.env.JWT_SECRET||process.env.JWT_SECRET_ACCESS_TOKEN)}},59984:(a,b,c)=>{"use strict";c.d(b,{IG:()=>i,fJ:()=>h,j$:()=>e,ok:()=>g});var d=c(10641);class e extends Error{constructor(a,b){super(b),this.name="HttpError",this.status=a}}function f(a,b=200){return d.NextResponse.json(a,{status:b})}function g(a,b=200){return f(a,b)}function h(a,b){return f({message:b,error:!0,success:!1},a)}function i(a){return a instanceof e?h(a.status,a.message):(console.error("[native-api]",a),h(500,"Internal server error"))}},60100:(a,b,c)=>{"use strict";c.d(b,{ET:()=>g,G8:()=>i,KK:()=>h,R9:()=>j});var d=c(59984),e=c(63346),f=c(35984);function g(a){let b=(0,e.UM)(a,"accessToken")||(0,e.dS)(a);if(!b)throw new d.j$(401,"Unauthorized");try{return(0,f.$Y)(b).id}catch{throw new d.j$(401,"Unauthorized")}}function h(a){let b=(0,e.UM)(a,"refreshToken")||(0,e.dS)(a);if(!b)throw new d.j$(401,"No refresh token provided");return b}function i(a,b){let c=(0,e.UM)(a,"passwordResetToken");if(!c)throw new d.j$(403,"Password reset session expired");try{let a=(0,f.$$)(c);if("password-reset"!==a.purpose||String(a.email).toLowerCase()!==String(b).toLowerCase())throw Error("invalid");return a.email}catch{throw new d.j$(403,"Password reset session expired")}}function j(a){try{return(0,f.En)(a)}catch{throw new d.j$(403,"Invalid refresh token")}}},63346:(a,b,c)=>{"use strict";c.d(b,{hf:()=>i,GQ:()=>k,dS:()=>m,UM:()=>l,w9:()=>h,bk:()=>j});let d=function(){if(process.env.COOKIE_DOMAIN)return String(process.env.COOKIE_DOMAIN).trim();try{let a=new URL(process.env.FRONTEND_URL||"");return a.hostname.startsWith("www.")?a.hostname.slice(4):a.hostname}catch{return}}(),e=function(){let a=String(process.env.COOKIE_SAME_SITE||"").trim().toLowerCase();return["lax","strict","none"].includes(a)?a:"lax"}(),f=function(a,b=!1){if(null==a||""===a)return b;let c=String(a).trim().toLowerCase();return!!["1","true","yes","on"].includes(c)||!["0","false","no","off"].includes(c)&&b}(process.env.COOKIE_SECURE,!0)||"none"===e;function g(a){return{httpOnly:!0,secure:f,sameSite:e,path:"/",maxAge:a,...d?{domain:d}:{}}}function h(a,{accessToken:b,refreshToken:c}){b&&a.cookies.set("accessToken",b,g(900)),c&&a.cookies.set("refreshToken",c,g(604800))}function i(a){a.cookies.set("accessToken","",{...g(0),expires:new Date(0)}),a.cookies.set("refreshToken","",{...g(0),expires:new Date(0)})}function j(a,b){a.cookies.set("passwordResetToken",b,g(600))}function k(a){a.cookies.set("passwordResetToken","",{...g(0),expires:new Date(0)})}function l(a,b){return a.cookies.get(b)?.value||null}function m(a){let b=a.headers.get("authorization");return b?.startsWith("Bearer ")&&b.slice(7).trim()||null}},78335:()=>{},96487:()=>{}};