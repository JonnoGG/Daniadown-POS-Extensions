import { extension, Tile } from "@shopify/ui-extensions/point-of-sale";

export default extension("pos.home.tile.render", (root, api) => {
    const shouldEnable = (subtotal: string, customer: any): boolean => {
        // always enabled during brentwood closing sale, uncomment below line when removing brentwood button
        return Boolean(Number(subtotal) && customer);
        //return true; //comment out when brentwood sale is over
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
        onPress: () => api.action.presentModal(),
    });

    //Subscribe to cart changes to see if tile should be enabled
    api.cart.subscribable.subscribe((cart) => {
        tile.updateProps({ enabled: shouldEnable(cart.subtotal, cart.customer) });
        tile.updateProps({ subtitle: updateInstructionMsg(cart.subtotal, cart.customer) });
        //tile.updateProps();
    });
    root.append(tile);
    root.mount();
});