(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // node_modules/@shopify/retail-ui-extensions/build/esm/extend.mjs
  var extend;
  var init_extend = __esm({
    "node_modules/@shopify/retail-ui-extensions/build/esm/extend.mjs"() {
      extend = (...args) => globalThis.shopify.extend(...args);
    }
  });

  // node_modules/@remote-ui/core/build/esm/component.mjs
  function createRemoteComponent(componentType) {
    return componentType;
  }
  var init_component = __esm({
    "node_modules/@remote-ui/core/build/esm/component.mjs"() {
    }
  });

  // node_modules/@remote-ui/core/build/esm/index.mjs
  var init_esm = __esm({
    "node_modules/@remote-ui/core/build/esm/index.mjs"() {
      init_component();
    }
  });

  // node_modules/@remote-ui/core/index.mjs
  var init_core = __esm({
    "node_modules/@remote-ui/core/index.mjs"() {
      init_esm();
    }
  });

  // node_modules/@shopify/retail-ui-extensions/build/esm/components/Tile/Tile.mjs
  var Tile;
  var init_Tile = __esm({
    "node_modules/@shopify/retail-ui-extensions/build/esm/components/Tile/Tile.mjs"() {
      init_core();
      Tile = createRemoteComponent("Tile");
    }
  });

  // node_modules/@shopify/retail-ui-extensions/build/esm/components/Button/Button.mjs
  var Button;
  var init_Button = __esm({
    "node_modules/@shopify/retail-ui-extensions/build/esm/components/Button/Button.mjs"() {
      init_core();
      Button = createRemoteComponent("Button");
    }
  });

  // node_modules/@shopify/retail-ui-extensions/build/esm/components/Stack/Stack.mjs
  var Stack;
  var init_Stack = __esm({
    "node_modules/@shopify/retail-ui-extensions/build/esm/components/Stack/Stack.mjs"() {
      init_core();
      Stack = createRemoteComponent("Stack");
    }
  });

  // node_modules/@shopify/retail-ui-extensions/build/esm/components/ScrollView/ScrollView.mjs
  var ScrollView;
  var init_ScrollView = __esm({
    "node_modules/@shopify/retail-ui-extensions/build/esm/components/ScrollView/ScrollView.mjs"() {
      init_core();
      ScrollView = createRemoteComponent("ScrollView");
    }
  });

  // node_modules/@shopify/retail-ui-extensions/build/esm/components/Screen/Screen.mjs
  var Screen;
  var init_Screen = __esm({
    "node_modules/@shopify/retail-ui-extensions/build/esm/components/Screen/Screen.mjs"() {
      init_core();
      Screen = createRemoteComponent("Screen");
    }
  });

  // node_modules/@shopify/retail-ui-extensions/build/esm/index.mjs
  var init_esm2 = __esm({
    "node_modules/@shopify/retail-ui-extensions/build/esm/index.mjs"() {
      init_extend();
      init_Tile();
      init_Button();
      init_Stack();
      init_ScrollView();
      init_Screen();
    }
  });

  // node_modules/@shopify/retail-ui-extensions/index.mjs
  var init_retail_ui_extensions = __esm({
    "node_modules/@shopify/retail-ui-extensions/index.mjs"() {
      init_esm2();
    }
  });

  // extensions/improved-discounts/src/index.ts
  var require_src = __commonJS({
    "extensions/improved-discounts/src/index.ts"(exports) {
      init_retail_ui_extensions();
      extend("pos.home.tile.render", (root, api) => {
        const shouldEnable = (subtotal, customer) => {
          return Boolean(Number(subtotal) && customer);
        };
        const updateInstructionMsg = (subtotal, customer) => {
          if (Number(subtotal) && customer) {
            return "Employee & designer discounts.";
          } else if (Number(subtotal)) {
            return "Employee & designer discounts.\nPlease add customer.";
          } else if (customer) {
            return "Employee & designer discounts.\nPlease add products.";
          } else {
            return "Employee & designer discounts.\nPlease add products & customer.";
          }
        };
        const tile = root.createComponent(Tile, {
          title: "DD Discounts",
          subtitle: "Employee & designer discounts.\nPlease add products & customer.",
          enabled: shouldEnable(api.cart.subscribable.initial.subtotal, api.cart.subscribable.initial.customer),
          onPress: api.smartGrid.presentModal
        });
        api.cart.subscribable.subscribe((cart) => {
          tile.updateProps({ enabled: shouldEnable(cart.subtotal, cart.customer) });
          tile.updateProps({ subtitle: updateInstructionMsg(cart.subtotal, cart.customer) });
        });
        root.appendChild(tile);
        root.mount();
      });
      extend("pos.home.modal.render", (root, api) => {
        const checkCustomerPrivilege = (customer, privilegeToCheck) => {
          if (customer.firstName.startsWith(privilegeToCheck)) {
            return true;
          }
          return false;
        };
        const updateDiscounts = (title, maxDiscount) => __async(exports, null, function* () {
          const items = api.cart.subscribable.initial.lineItems;
          const variantIds = items.map((item) => item.variantId);
          const lineItemIdsQuants = items.map((item) => ({ id: item.uuid, qauntity: item.quantity }));
          const response = yield api.productSearch.fetchProductVariantsWithIds(variantIds);
          const variants = yield response.fetchedResources;
          let LineItemDiscounts = [];
          for (let i = 0; i < variants.length; i++) {
            let fixedDiscountAmount;
            const price = Number(variants[i].price);
            const compAtPrice = Number(variants[i].compareAtPrice);
            const calculatedPrice = compAtPrice * (1 - maxDiscount);
            const lineItemIndex = variantIds.indexOf(variants[i].id);
            const lineItemId = lineItemIdsQuants[lineItemIndex].id;
            const lineItemQuant = lineItemIdsQuants[lineItemIndex].qauntity;
            if (compAtPrice == null || compAtPrice == 0) {
              fixedDiscountAmount = (price * maxDiscount * lineItemQuant).toFixed(2);
            } else if (price > calculatedPrice) {
              fixedDiscountAmount = ((price - calculatedPrice) * lineItemQuant).toFixed(2);
            } else {
              continue;
            }
            const LineItemDiscount = {
              title,
              type: "FixedAmount",
              amount: fixedDiscountAmount,
              test: "hello"
            };
            const SetLineItemDiscountInput2 = {
              lineItemUuid: String(lineItemId),
              lineItemDiscount: LineItemDiscount
            };
            LineItemDiscounts.push(SetLineItemDiscountInput2);
          }
          console.log(LineItemDiscounts);
          try {
            api.cart.bulkSetLineItemDiscounts(LineItemDiscounts);
            api.toast.show("Discount applied.", { duration: 3e3 });
          } catch (err) {
            console.log(err);
          }
        });
        let mainScreen = root.createComponent(Screen, {
          name: "Discounts",
          title: "Available Discounts"
        });
        let scrollView = root.createComponent(ScrollView);
        const designerDiscountBtn = root.createComponent(Button, {
          title: "Designer Discount - 25% off MSRP",
          onPress: () => {
            if (checkCustomerPrivilege(api.cart.subscribable.initial.customer, "DES -") || checkCustomerPrivilege(api.cart.subscribable.initial.customer, "DES-")) {
              updateDiscounts("Designer Discount", 0.25);
            } else {
              api.toast.show("Customer does not have designer privileges.", { duration: 3e3 });
            }
          }
        });
        const employeeDiscountBtn = root.createComponent(Button, {
          title: "Employee Discount - 30% off MSRP",
          onPress: () => {
            if (checkCustomerPrivilege(api.cart.subscribable.initial.customer, "EMP -") || checkCustomerPrivilege(api.cart.subscribable.initial.customer, "EMP-")) {
              updateDiscounts("Employee Discount", 0.3);
            } else {
              api.toast.show("Customer does not have employee privileges.", { duration: 3e3 });
            }
          }
        });
        const buttonStack = root.createComponent(Stack, {
          direction: "vertical"
        });
        scrollView.appendChild(buttonStack);
        buttonStack.appendChild(designerDiscountBtn);
        buttonStack.appendChild(employeeDiscountBtn);
        mainScreen.appendChild(scrollView);
        root.appendChild(mainScreen);
        root.mount();
      });
    }
  });

  // <stdin>
  var import_src = __toESM(require_src());
})();
//# sourceMappingURL=daniadown-discounts.js.map
