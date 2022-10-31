import * as VueRouter from "vue-router";
//路由规则描述数组
const routes = [
  { path: "/", redirect: "/WindowMain/Chat" },
  {
    path: "/WindowMain",
    component: () => import("./views/WindowMain.vue"),
    children: [
      { path: "Chat", component: () => import("./views/WindowMain/Chat.vue") },
      { path: "Contact", component: () => import("./views/WindowMain/Contact.vue") },
      { path: "Collection", component: () => import("./views/WindowMain/Collection.vue") },
    ],
  },
  {
    path: "/WindowSetting",
    component: () => import("./views/WindowSetting.vue"),
    children: [{ path: "AccountSetting", component: () => import("./views/WindowSetting/AccountSetting.vue") }],
  },
  {
    path: "/WindowUserInfo",
    component: () => import("./views/WindowUserInfo.vue"),
  },
];
//导出路由对象
export const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes,
});
