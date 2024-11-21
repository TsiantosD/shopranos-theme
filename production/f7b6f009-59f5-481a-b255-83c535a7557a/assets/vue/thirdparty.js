//write script here     <script type="text/javascript" src="https://unpkg.com/storage-based-queue@1.2.2/dist/queue.min.js"></script>
const _subscribe = mitt()

var x = ['add-to-cart', 'quick-add-to-cart', 'remove-from-cart', 'calculated-cart', 'in-cart-items-changed', 'update-wishlist', 'view-wishlist', 'page-view', 'product-view',
    'collection-view', 'category-view', 'brand-view', 'proceed-to-checkout', 'abandon-checkout', 'initiate-payment', 'complete-checkout',
    'search-results', 'form-submission', 'subscribe-to-newsletter', 'user-sign-in', 'user-sign-out', 'user-register', 'user-forgot-password'];

const queue = new Queue();
//queue.setTimeout(500);
queue.setLimit(50);
queue.setPrinciple(Queue.LIFO);
queue.setStorage("localstorage");
queue.setDebug(true);
const channel = queue.create("send-message");


for (let i = 0; i < x.length; i++) {
    emitter.on(x[i], e => {
        switch (x[i]) {
            case 'category-view':
                e.data = { alias: e.data.alias, title: e.data.title, treeIds: e.data.treeIds };
                break;
            case 'brand-view':
                e.data = { alias: e.data.alias, code: e.data.code, name: e.data.name };
                break;
            case 'collection-view':
                e.data = { alias: e.data.alias, status: e.data.status,text:e.data.text };
                break;
            case 'product-view': 
                e.data = { alias: e.data.alias, availability: e.data.availability, maxPrice: e.data.maxPrice, minPrice: e.data.minPrice,pathCategories:e.data.pathCategories,brandId:e.data.brandId,categoryId:e.data.categoryId,id:e.data.id };
                break;
            case 'calculated-cart':
                e.data = { netAmount: e.data.netAmount, totalAmount: e.data.totalAmount, billingAddress: e.data.billingAddress, shippingAddress: e.data.shippingAddress, cartItems: e.data.cartItems.map(({ id, sku, quantity, lineValue }) => ({ id, sku, quantity, lineValue })) };
                break;
            case 'proceed-to-checkout':
                e.data = { netAmount: e.data.netAmount, totalAmount: e.data.totalAmount, billingAddress: e.data.billingAddress, shippingAddress: e.data.shippingAddress, cartItems: e.data.cartItems.map(({ id, sku, quantity, lineValue }) => ({ id, sku, quantity, lineValue })) };
                break;
            case 'complete-checkout':
                e.data = { netAmount: e.data.netAmount, totalAmount: e.data.totalAmount, billingAddress: e.data.billingAddress, shippingAddress: e.data.shippingAddress, cartItems: e.data.cartItems.map(({ id, sku, quantity, lineValue }) => ({ id, sku, quantity, lineValue })) };
                break;
            case 'view-wishlist':
                e.data = { lists: e.data.map(({ id, title, customerId, userId, alias, items }) => ({ id, title, customerId, userId, alias, items })) };
                break;
            case 'update-wishlist':
                e.data = { id: e.data.id, title: e.data.title, customerId: e.data.customerId, userId: e.data.userId, alias: e.data.alias, items: e.data.items };
                break;
            case 'search-results':
                e.data = { products:e.data.map(({ alias, availability, brandId, categoryId, id, maxPrice, minPrice, pathCategories }) => ({ alias, availability, brandId, categoryId, id, maxPrice, minPrice, pathCategories })) };
                break;
        }
        var company = app.config.globalProperties._company;
        e.company = {
            id: company.id,
            name: company.name,
        };
        if (app.config.globalProperties._global.isAuthenticated) {
            e.user = {
                firstName: app.config.globalProperties._global.firstName,
                lastName: app.config.globalProperties._global.lastName,
                userId: app.config.globalProperties._global.userId 
            }
        }
        channel
            .add({
                label: x[i],
                handler: "SendMessageWorker",
                args: {
                    event: x[i], message: e
                }
            })
            .then(result => {
                // do something...
            });
        // _subscribe.emit(x[i], e);
    });
}
class SendMessageWorker {
    debugger;
    retry = 5;
    handle(message) {
        // If return value is false, this task will retry until retry value 5.
        // If retry value is 5 in worker, current task will be as failed and freezed in the task pool.


        // Should return true or false value (boolean) that end of the all process
        // If process rejected, current task will be removed from task pool in worker.
        return new Promise((resolve, reject) => {
            // A function is called in this example.
            // The async operation is started by resolving the promise class with the return value.
            _subscribe.emit(message.event, message.message);
            resolve(true);
            // const result = someMessageSenderFunc(message);
            // if (result) {
            // Task will be completed successfully
            // resolve(true);
            //  } else {
            // Task will be failed.
            // If retry value i not equal to 5,
            // If the retry value was not 5, it is being sent back to the pool to try again.
            //     resolve(false);
            // }
        });
    }
}

Queue.workers({ SendMessageWorker });
channel.start();