// include product model
const Product = require('../model/product');
const Cart = require('../model/cart');

// create a new Product.
exports.product_create = function (req, res) {
    console.log(req.body,res.body);
    // validate request
    if(!req.body.name || !req.body.price) {
        return res.status(400).send({
            success: false,
            message: "Please enter product name and price"
        });
    }

   
//check if the product name already exists in db
Product.findOne({ name: req.body.name }, (err, data) => {

    //if product not in db, add it
    if (!data) {
        let productPictures = [];
            if(req.files){
            if (req.files.length > 0) {
                        productPictures = req.files.map((file) => {
                        return { img: file.filename };
                        });
                    }
            }
      
        //create a new product object using the Product model and req.body
      
        let product = new Product(
            {
                name: req.body.name,
                price: req.body.price,
                productPictures:productPictures,
                description:req.body.description,
                //postid:req.body.postid,
                //image: req.file.path,
            }
        );

      
        // save this object to database
            product.save()
            .then(data => {
                //console.log(data._id);
                res.send({
                    success: true,
                    message: 'Product successfully created',
                    data: data
                });
            }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while creating the product."
            });
        });
    //if there's an error or the tea is in db, return a message         
    }else{
        if(err) return res.json(`Something went wrong, please try again. ${err}`);
        return res.json({message:"Product already exists"});
    }
})   
    
};
const getPagination = (page, size) => {
    const limit = size ? +size : 100;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
  };
// retrieve and return all products.
exports.all_products = (req, res) => {
 
var total_count="";
   // Count the total documents
   Product.countDocuments().then((count_documents) => {
    total_count = count_documents;
    const { limit, offset } = getPagination(req.body.page, req.body.limit);
    Product.find().sort({_id:1}).skip(offset).limit(limit)
    .then(data => {
      
      
            var message = "";
            if (data === undefined || data.length == 0) message = "No product found!";
            else message = 'Products successfully retrieved';

            res.send({
                success: true,
                message: message,
                data: data,
                total_row:data.length,
                total_count:total_count
            });
        }).catch(err => {
        res.status(500).send({
            success: false,
            message: err.message || "Some error occurred while retrieving products."
        });
    });
  }).catch((err) => {
    console.log(err.Message);
    res.status(500).send({
        success: false,
        message: err.message || "Some error occurred while retrieving products."
    });
  })
      

};

// find a single product with a id.
exports.product_details = (req, res) => {
    Product.findById(req.params.id)
        .then(data => {
            if(!data) {
                return res.status(404).send({
                    success: false,
                    message: "Product not found with id " + req.params.id
                });
            }
            res.send({
                success: true,
                message: 'Product successfully retrieved',
                data: data
            });
        }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                success: false,
                message: "Product not found with id " + req.params.id
            });
        }
        return res.status(500).send({
            success: false,
            message: "Error retrieving product with id " + req.params.id
        });
    });
};

// update a product  by the id.
exports.product_update = (req, res) => {
    // validate request
    // if(!req.body.name || !req.body.price) {
    //     return res.status(400).send({
    //         success: false,
    //         message: "Please enter product name and price"
    //     });
    // }
  
    if(Object.keys(req.body).length === 0 && req.body.constructor === Object) {
        return res.status(400).send({
            success: false,
            message: "Please add data to update6."
        });
    }
    let productPictures = [];
    if(req.files){
        
        if (req.files.length > 0) {
            productPictures = req.files.map((file) => {
            return { img: file.filename };
            });
        }
    }

 req.body.productPictures = productPictures;

    // find product and update
    Product.findByIdAndUpdate(req.params.id, {
        $set: req.body
      
    }, {new: true})
        .then(data => {
            if(!data) {
                return res.status(404).send({
                    success: false,
                    message: "Product not found with id " + req.params.id
                });
            }
            res.send({
                success: true,
                data: data
            });
        }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                success: false,
                message: "Product not found with id " + req.params.id
            });
        }
        return res.status(500).send({
            success: false,
            message: "Error updating product with id " + req.params.id
        });
    });
};

// delete a product with the specified id.
exports.product_delete = (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    success: false,
                    message: "Product not found with id " + req.params.id
                });
            }
            res.send({
                success: true,
                message: "Product successfully deleted!"
            });
        }).catch(err => {
        if (err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                success: false,
                message: "Product not found with id " + req.params.id
            });
        }
        return res.status(500).send({
            success: false,
            message: "Could not delete product with id " + req.params.id
        });
    });
};


// Add to cart a product with the specified id.
exports.product_addTocart =  async (req, res) => {
    const { userId,productId, name, price,quantity } = req.body;
    try {
        let cart = await Cart.findOne({ userId });
       
            if (cart) {
                      //cart exists for user
                      
                let itemIndex = cart.products.findIndex(p => p.productId == productId);
              
                if (itemIndex > -1) {
                      //product exists in the cart, update the quantity
                      let productItem = cart.products[itemIndex];
                      productItem.quantity = quantity;
                      cart.products[itemIndex] = productItem;
                } else {
                      //product does not exists in cart, add new item
                      cart.products.push({ productId, quantity, name, price });
                }
                      cart = await cart.save();
                      return res.status(201).send(cart);
            }else {
                      
                      //no cart for user, create new cart
                      const newCart = await Cart.create({
                      userId,
                      products: [{ productId, quantity, name, price }]
                      });
              
                      return res.status(201).send(newCart);
            }
      
    } catch (err) {
      console.log(err);
      res.status(500).send("Something went wrong");
    }
  }

  // retrieve and return all products in cart.
exports.product_cart = (req, res) => {
    Cart.findById(req.params.id)
        .then(data => {
          
          
                var message = "";
                if (data === undefined || data.length == 0) message = "No cart found!";
                else message = 'Cart Products successfully retrieved';
    
                res.send({
                    success: true,
                    message: message,
                    data: data
                });
            }).catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Some error occurred while retrieving cart."
            });
       
      }).catch((err) => {
        console.log(err.Message);
        res.status(500).send({
            success: false,
            message: err.message || "Some error occurred while retrieving cart."
        });
      })
};