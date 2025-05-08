import { extension, Screen, Button, ScrollView, Stack } from "@shopify/ui-extensions/point-of-sale";


export default extension("pos.home.modal.render", (root, api) => {
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
            // if (
            //     checkCustomerPrivilege(api.cart.subscribable.initial.customer, "DES -") ||
            //     checkCustomerPrivilege(api.cart.subscribable.initial.customer, "DES-")
            // ) {
            //if (true) {
                updateDiscounts("Designer Discount", 0.25);
            // } else {
            //     api.toast.show("Customer does not have designer privileges.", { duration: 3000 });
            // }
        },
    });

    const employeeDiscountBtn = root.createComponent(Button, {
        title: "Employee Discount - 30% off MSRP",
        onPress: () => {
            // if (
            //     checkCustomerPrivilege(api.cart.subscribable.initial.customer, "EMP -") ||
            //     checkCustomerPrivilege(api.cart.subscribable.initial.customer, "EMP-")
            // ) {
            //if (true) {
                updateDiscounts("Employee Discount", 0.3);
            // } else {
            //     api.toast.show("Customer does not have employee privileges.", { duration: 3000 });
            // }
        },
    });

    // const brentwoodDiscountBtn = root.createComponent(Button, {
    //     title: "Brentwood Closing Sale - 30% off MSRP",
    //     onPress: () => {
    //         updateDiscounts("Closing Sale", 0.3);
    //     },
    // });

    const buttonStack = root.createComponent(Stack, {
        direction: "block",
        alignContent: "stretch",
        gap: '200',
    });

    //Add components to modal
    scrollView.append(buttonStack);
    buttonStack.append(designerDiscountBtn);
    buttonStack.append(employeeDiscountBtn);
    // Comment out below when brentwood sale is over
    //buttonStack.appendChild(brentwoodDiscountBtn);
    mainScreen.append(scrollView);
    root.append(mainScreen);
    root.mount();
});
