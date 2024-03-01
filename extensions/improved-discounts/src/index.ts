import {
    extend,
    Screen,
    Tile,
    Button,
    DiscountType,
    ScrollView,
    SetLineItemDiscountInput,
    Stack,
} from "@shopify/retail-ui-extensions";

extend("pos.home.tile.render", (root, api) => {
    const shouldEnable = (subtotal: string, customer: any): boolean => {
        const privilegedCustomer = Boolean;

        return Boolean(Number(subtotal) && customer);
    };

    const updateInstructionMsg = (subtotal: string, customer: any): string => {
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

    // You can use the initial cart value to set up state
    const tile = root.createComponent(Tile, {
        title: "DD Discounts",
        subtitle: "Employee & designer discounts.\nPlease add products & customer.",
        enabled: shouldEnable(api.cart.subscribable.initial.subtotal, api.cart.subscribable.initial.customer),
        onPress: api.smartGrid.presentModal,
    });

    // You can subscribe to changes in the cart to mutate state
    api.cart.subscribable.subscribe((cart) => {
        tile.updateProps({ enabled: shouldEnable(cart.subtotal, cart.customer) });
        tile.updateProps({ subtitle: updateInstructionMsg(cart.subtotal, cart.customer) });
        //tile.updateProps();
    });
    root.appendChild(tile);
    root.mount();
});

extend("pos.home.modal.render", (root, api) => {
    //Checks if the passed customer is a designer or employee
    const checkCustomerPrivilege = (customer: any, privilegeToCheck: string) => {
        if (customer.firstName.startsWith(privilegeToCheck)) {
            return true;
        }
        return false;
    };
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
            if (
                checkCustomerPrivilege(api.cart.subscribable.initial.customer, "DES -") ||
                checkCustomerPrivilege(api.cart.subscribable.initial.customer, "DES-")
            ) {
                updateDiscounts("Designer Discount", 0.25);
            } else {
                api.toast.show("Customer does not have designer privileges.", { duration: 3000 });
            }
        },
    });

    const employeeDiscountBtn = root.createComponent(Button, {
        title: "Employee Discount - 30% off MSRP",
        onPress: () => {
            if (
                checkCustomerPrivilege(api.cart.subscribable.initial.customer, "EMP -") ||
                checkCustomerPrivilege(api.cart.subscribable.initial.customer, "EMP-")
            ) {
                updateDiscounts("Employee Discount", 0.3);
            } else {
                api.toast.show("Customer does not have employee privileges.", { duration: 3000 });
            }
        },
    });

    const buttonStack = root.createComponent(Stack, {
        direction: "vertical",
    });

    //Add components to modal
    scrollView.appendChild(buttonStack);
    buttonStack.appendChild(designerDiscountBtn);
    buttonStack.appendChild(employeeDiscountBtn);
    mainScreen.appendChild(scrollView);
    root.appendChild(mainScreen);
    root.mount();
});
