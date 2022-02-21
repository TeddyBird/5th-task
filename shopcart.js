const apiUrl = "https://vue3-course-api.hexschool.io/v2";
const apiPath = "tedbirdy";

VeeValidate.defineRule('email', VeeValidateRules['email']);
VeeValidate.defineRule('required', VeeValidateRules['required']);
VeeValidate.defineRule('max', VeeValidateRules['max']);
VeeValidate.defineRule('min', VeeValidateRules['min']);
VeeValidate.defineRule('numeric', VeeValidateRules['numeric']);

VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});

  
const app = Vue.createApp({
    data(){
        return{
            cartData:{
                carts:[],
            },
            products:{},
            productId:"",
            isLoading:"",
            form: {
                user: {
                  name: '',
                  email: '',
                  tel: '',
                  address: '',
                },
                message: '',
            },
        }
    },

    methods:{
        //取得全部商品資料
        getProducts(){
            axios.get(`${apiUrl}/api/${apiPath}/products/all`)
            .then((res)=>{
                this.products = res.data.products;
            })
        },
        //打開商品資訊
        openProductModal(id){
            this.$refs.productModal.openModal();
            this.productId = id;
        },
        //取得購物車資料
        getCart(){
            axios.get(`${apiUrl}/api/${apiPath}/cart`)
            .then((res)=>{
                this.cartData = res.data.data;
            })
        },
        //加入購物車
        addCart(id,qty = 1){
            const data = {
                product_id: id,
                qty,
            };
            this.isLoading = id;
            axios.post(`${apiUrl}/api/${apiPath}/cart`,{data})
            .then(()=>{
                this.getCart();
                this.isLoading = "";
                this.$refs.productModal.closeModal();
            })
        },
        //刪除購物車(個別)
        removeCart(id){
            this.isLoading = id;
            axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
            .then(()=>{
                this.getCart();
                this.isLoading = "";
            })
        },
        //刪除購物車(全部)
        removeAllCart(){
            axios.delete(`${apiUrl}/api/${apiPath}/carts`)
            .then(()=>{
                this.getCart();
            })
        },

        //修改購物車數量
        updateCart(item){
            const data = {
                product_id: item.id,
                qty: item.qty,
            };
            this.isLoading = item.id;
            axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`,{data})
            .then((res)=>{
                this.getCart();
                this.isLoading = "";
            })
        },
        //送出訂單
        createOrder(){
            const order = this.form;
            const url = `${apiUrl}/api/${apiPath}/order`;
            axios.post(url, {data: order})
            .then((res)=>{
                alert(res.data.message);
                this.$refs.form.resetForm();//清空表單
                this.getCart();
            });
  
        },
    },
    mounted() {
        this.getProducts();
        this.getCart();
    },

});

app.component("product-modal",{
    template:"#userProductModal",
    props:["id"],
    data(){
        return{
            modal:{},
            product:{},
            qty:1,
        }
    },
    methods:{
        openModal(){
            this.modal.show();
            this.qty = 1;
        },

        closeModal(){
            this.modal.hide();
        },
        //產品詳細資料
        getProduct(){
            axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
            .then((res)=>{
                this.product = res.data.product;
            })
        },
        //加入購物車
        addToCart(){
            this.$emit("add-cart",this.product.id,this.qty);
        },
    },
    watch:{
        id(){
            this.getProduct();
        },
    },

    mounted(){
        this.modal = new bootstrap.Modal(this.$refs.modal);
    },
});

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount("#app");