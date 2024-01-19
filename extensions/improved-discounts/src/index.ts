import {
  extend,
  Screen,
  Tile,
  Button,
  DiscountType,
  ScrollView,
  SetLineItemDiscountInput,
} from "@shopify/retail-ui-extensions";

extend("pos.home.tile.render", (root, api) => {
  const shouldEnable = (subtotal: string): boolean => {
    return Number(subtotal) > 100;
  };

  // You can use the initial cart value to set up state
  const tile = root.createComponent(Tile, {
    title: "DD Discounts",
    subtitle: "Employee & designer discounts",
    enabled: shouldEnable(api.cart.subscribable.initial.subtotal),
    onPress: api.smartGrid.presentModal,
  });

  // You can subscribe to changes in the cart to mutate state
  api.cart.subscribable.subscribe((cart) => {
    tile.updateProps({ enabled: Number(cart.subtotal) > 0 });
  });
  root.appendChild(tile);
  root.mount();
});

extend("pos.home.modal.render", (root, api) => {
  //Function to apply the discounts to the cart
  const updateDiscounts = async (title: string, maxDiscount: number) => {
    const items = api.cart.subscribable.initial.lineItems;
    const variantIds = items.map((item) => item.variantId!);
    const lineItemIdsQuants = items.map((item) => ({ id: item.uuid, qauntity: item.quantity }));

    //get variant details from Shopify Admin (need the compare-at-price)
    const response = await api.productSearch.fetchProductVariantsWithIds(variantIds);
    const variants = await response.fetchedResources;

    let LineItemDiscounts: any[] = [];

    //Loop through items in cart to calculate how much of a discount to apply
    for (let i = 0; i < variants.length; i++) {
      let fixedDiscountAmount: string;
      const price = Number(variants[i].price);
      const compAtPrice = Number(variants[i].compareAtPrice);
      const calculatedPrice = compAtPrice * (1 - maxDiscount);

      //find lineItem Uuid for current variantId
      const lineItemIndex = variantIds.indexOf(variants[i].id);
      const lineItemId = lineItemIdsQuants[lineItemIndex].id;
      const lineItemQuant = lineItemIdsQuants[lineItemIndex].qauntity;

      //Compare price and compare at price to determine how much discount to apply to get to "maxDiscount" value
      if (compAtPrice == null || compAtPrice == 0) {
        fixedDiscountAmount = (price * maxDiscount * lineItemQuant).toFixed(2);
      } else if (price > calculatedPrice) {
        fixedDiscountAmount = ((price - calculatedPrice) * lineItemQuant).toFixed(2);
      } else {
        continue;
      }
      //Set up LineItemsDiscounts obbject for api call to set discounts
      const LineItemDiscount = {
        title: title,
        type: "FixedAmount",
        amount: fixedDiscountAmount,
        test: "hello",
      };

      const SetLineItemDiscountInput = {
        lineItemUuid: String(lineItemId),
        lineItemDiscount: LineItemDiscount,
      };
      LineItemDiscounts.push(SetLineItemDiscountInput);
    }
    console.log(LineItemDiscounts);
    //API call to bulk set the line item discounts
    try {
      api.cart.bulkSetLineItemDiscounts(LineItemDiscounts);
      api.toast.show("Discount applied.", { duration: 3000 });
    } catch (err) {
      console.log(err);
    }
  };
  //Text at top of modal
  let mainScreen = root.createComponent(Screen, {
    name: "Discounts",
    title: "Available Discounts",
  });
  let scrollView = root.createComponent(ScrollView);

  //Create button for designer discount
  const designerDiscountBtn = root.createComponent(Button, {
    title: "Designer Discount - 25% off MSRP",
    onPress: () => {
      updateDiscounts("Designer Discount", 0.25);
    },
  });

  //Add components to modal
  scrollView.appendChild(designerDiscountBtn);
  mainScreen.appendChild(scrollView);
  root.appendChild(mainScreen);
  root.mount();
});
