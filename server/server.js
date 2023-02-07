const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const generator = require('generate-password');
const nodemailer = require('nodemailer');

/*const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const sp = new SerialPort('COM10')

const parser = sp.pipe(new Readline({ delimiter: '\n' }))*/

let transporter = nodemailer.createTransport(
{
    service: 'gmail',
    auth: {
        user: 'anisrouane2@gmail.com',
        pass:'abdour2019'
    }
})

const CryptoJS = require('crypto-js');

const hasher = require('password-hash');


const admin = require('firebase-admin');

const serviceAccount = require('./inanny-d428d-firebase-adminsdk-mkz7l-aad77058b6.json');
const { info } = require("console");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
}); 

/*app.get("/",(req,res) => 
{
    res.sendFile(__dirname+"/arduino/arduino.html");
});*/

const db = admin.firestore();

const port = process.env.PORT || 4001;

io.on("connection", (socket) => {
    
    socket.on("camera_event", (image) => 
    {
        console.log(image);
        socket.broadcast.emit("new_image", "data:image/png;base64,"+ image.image_data.toString('base64'));
    });
    
    /*socket.on("alert", ({message, productId}) => 
    {
        const products = db.collection('products').doc(productId).get().then(doc => 
        {
            let data = doc.data();
            
            Object.keys(data["admin"]).forEach((key) => 
            {
                const mailOptions = {
                    from: 'INanny',
                    to: key,
                    subject: "ALERTE DANGER !",
                    html: "<div>"+
                                "<h1 style='color:red'>ATTENTION DANGER !<h1>" +
                                "<h2>Nous vous alertons que votre nourrisson est sujet à un potentiel danger</h2>"+
                                "<h4>"+message+"</h4>"+
                          "</div>"
                };
            
                transporter.sendMail(mailOptions, (error, info) =>
                {
                    if (error) 
                    {
                        console.log(error);
                    } 
                })
            });

            Object.keys(data["users"]).forEach((key) => 
            {
                const mailOptions = {
                    from: 'INanny',
                    to: key,
                    subject: "ALERTE DANGER",
                    html: "<div>"+
                                "<h1 style='color:red'>ATTENTION DANGER !<h1>" +
                                "<h2>Nous vous alertons que votre nourrisson est sujet à un potentiel danger</h2>"+
                                "<h4>"+message+"</h4>"+
                          "</div>"
                };
            
                transporter.sendMail(mailOptions, (error, info) =>
                {
                    if (error) 
                    {
                        console.log(error);
                    } 
                })
            });

        });
        socket.broadcast.emit("alert", message);
    });*/

    socket.on("client_handshake", () => 
    {
        console.log("New client connected!");
    });

    socket.on("login", (user_session, infos) => 
    {
        if(user_session === null)
        {
            const products = db.collection('products');
            let found = false;
            products.get().then(snapshot => {
                snapshot.forEach(doc => {
                    data = doc.data();
                    if(typeof(data["admin"][infos.email]) != "undefined")
                    {
                        if(hasher.verify(infos.password, data["admin"][infos.email].pass))
                        {
                            let new_session = {
                                
                                email: infos.email,
                                productId: doc.id,
                                type: "admin"
                            }

                            found = true;

                            let crypted_session = CryptoJS.AES.encrypt(JSON.stringify(new_session), 
                                                                        "session").toString();
                            
                            socket.emit("success", crypted_session);
                            return;
                        }
                        else 
                        {
                            socket.emit("errors", {mail: null, pass: null, neutral: "Adresse email ou mot de passe incorrect"});
                            return;
                        }
                    }
                    else 
                    {
                        if(typeof(data["users"][infos.email]) != "undefined")
                        {
                            if(hasher.verify(infos.password, data["users"][infos.email].pass))
                            {
                                found = true;
                                if(data["users"][infos.email].isActive)
                                {
                                    let new_session = {
                                        email: infos.email,
                                        productId: doc.id,
                                        type: "users"
                                    }

                                    let crypted_session = CryptoJS.AES.encrypt(JSON.stringify(new_session), 
                                                                                "session").toString();
                                    
                                    socket.emit("success", crypted_session);
                                }
                                else 
                                {
                                    socket.emit("errors", {mail: null, pass: null, neutral: "Votre compte a été désactivé par l'administrateur, veuillez le contacter."});
                                }
                                return;
                            }
                            else 
                            {
                                socket.emit("errors", {mail: null, pass: null, neutral: "Adresse email ou mot de passe incorrect"});
                                return;
                            }
                        }
                    }
                });
            })
            .then(()=> 
            {
                if(!found)
                {
                    socket.emit("errors", {mail: null, pass: null, neutral: "Adresse email ou mot de passe incorrect"});
                }
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
        }
    });

    socket.on("req_add_user", (infos, user_session) => 
    {
        if(user_session !== null)
        {
            const products = db.collection('products');
            let error = false;
            let errorsMsg = {email: null, fname: null, lname: null, pnum: null};
            products.get().then(snapshot => {
                snapshot.forEach(doc => {
                    data = doc.data();

                    if(typeof(data["admin"][infos.email]) != "undefined")
                    {
                        error = true;
                        errorsMsg["email"] = "Cette adresse email est déjà utilisée.";
                    }

                    if(typeof(data["users"][infos.email]) != "undefined")
                    {
                        error = true;
                        errorsMsg["email"] = "Cette adresse email est déjà utilisée.";
                    }
                        
                    Object.keys(data["users"]).forEach(function(key) 
                    {
                        if(data["users"][key].pnum === infos.pnum)
                        {
                            error = true;
                            errorsMsg["pnum"] = "Ce numéro de téléphone est déjà utilisé";
                            return;
                        }
                    });

                    Object.keys(data["admin"]).forEach(function(key) 
                    {
                        if(data["admin"][key].pnum === infos.pnum)
                        {
                            error = true;
                            errorsMsg["pnum"] = "Ce numéro de téléphone est déjà utilisé";
                            return;
                        }
                    });

                    
                });
            }).then(() => 
            {
                if(error)
                {
                    socket.emit("error_add_user", errorsMsg);
                    return;
                }
                else 
                {
                    const password = generator.generate({
                        length: 10,
                        numbers: true
                    });
                    let new_user = {};
                    new_user[infos.email] = {};
                    new_user[infos.email]["fname"] = infos.fname;
                    new_user[infos.email]["lname"] = infos.lname;
                    new_user[infos.email]["pnum"] = infos.pnum;
                    new_user[infos.email]["isActive"] = true;
                    new_user[infos.email]["pass"] = hasher.generate(password);
                    new_user[infos.email]["cam"] = infos.cam
                    new_user[infos.email]["addDate"] = new Date().toLocaleString();
                    new_user[infos.email]["addDate"] = new Date().toLocaleString();
                    let userDatas = JSON.parse(CryptoJS.AES.decrypt(user_session, 'session').toString(CryptoJS.enc.Utf8));
                    const mailOptions = {
                        from: 'anisrouane2@gmail.com',
                        to: infos.email,
                        subject: "Votre compte INANNY est prêt!",
                        html: "<div>"+
                                    "<h1>Cher "+infos.lname+" "+infos.fname+"<h1>" +
                                    "<h2>Nous avons le plaisir de vous annoncer que votre compte INanny a "+
                                    "été créé avec succès.</h2>" +
                                    "<p>Vous pouvez dès à présent accéder à votre compte en utilisant votre email " +
                                    "ainsi que votre mot de passe que personne d'autre que vous ne connait."+
                                    "<br><br>" +
                                    "<b>Votre mot de passe:</b> " + password + "<br><br>"+
                                    "Nous souhaitons une bonne santé à votre enfant, insha'Allah."+
                              "</div>"
                    };
                
                    transporter.sendMail(mailOptions, (error, info) =>
                    {
                        if (error) 
                        {
                            console.log(error);
                            socket.emit("unexpected_error");
                        } 
                        else 
                        {
                            products.doc(userDatas.productId).set(
                            {
                                "users": new_user    
                            },{merge:true}).then(() => {
                                socket.emit("add_user_success");
                            });
                        }
                    })
                }
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
        }
    });

    socket.on("req_users_list", (user_session) =>
    {
        let userDatas = JSON.parse(CryptoJS.AES.decrypt(user_session, 'session').toString(CryptoJS.enc.Utf8));
        const userRef = db.collection('products').doc(userDatas.productId).get().then(doc => 
        {
            let userList = [];
            let data = doc.data()["users"];

            Object.keys(data).forEach(function(key) 
            {
                userList.push(
                {
                    email: key,
                    fname: data[key].fname,
                    lname: data[key].lname,
                    pnum: data[key].pnum,
                    isActive: data[key].isActive,
                    addDate: data[key].addDate
                });
            });

            userList.sort((a, b) => {
                const c = new Date(a.addDate);
                const d = new Date(b.addDate);
                return c-d;
            });
            
            socket.emit("res_users_list", userList.reverse());
        });
    });

    socket.on("get_user_req", (user_session) => 
    {
        if(user_session !== null)
        {
            let userDatas = JSON.parse(CryptoJS.AES.decrypt(user_session, 'session').toString(CryptoJS.enc.Utf8));
            const userRef = db.collection('products').doc(userDatas.productId).get().then(doc => 
            {
                let data = doc.data()[userDatas.type][userDatas.email];
                let userInformations = {
                    fname: data.fname,
                    lname: data.lname,
                    pnum: data.pnum,
                    email: userDatas.email,
                    isAdmin: (userDatas.type==="admin")
                } 
                
                socket.emit("get_user_res", userInformations);
            });
        }
    });

    socket.on("btmp_handshake", (new_data) => 
    {
        socket.broadcast.emit("update_btmp_data", new_data); 
    });

    socket.on("req_obj_list", (user_session) => 
    {
        let userDatas = JSON.parse(CryptoJS.AES.decrypt(user_session, 'session').toString(CryptoJS.enc.Utf8));
        const userRef = db.collection('products').doc(userDatas.productId).get().then(doc => 
        {
            let data = doc.data()["Sensors"]
            let oList = [];
            oList.push({data: data.atemp, type:"atemp"});
            oList.push({data: data.btemp, type:"btemp"});
            oList.push({data: data.hum, type:"hum"});
            oList.push({data: data.dust, type:"dust"});
            oList.push({data: data.cam, type:"cam"});
            socket.emit("res_obj_list", oList);
        });
    });

    socket.on("changeObjectStatus", ({data_key, status}, user_session) => 
    {
        let userDatas = JSON.parse(CryptoJS.AES.decrypt(user_session, 'session').toString(CryptoJS.enc.Utf8));
        db.collection('products').doc(userDatas.productId).update(
        {
            [`Sensors.${data_key}.isActive`]: status
        })
    });

    socket.on("changeUserStatus", ({data_key, status}, user_session) => 
    {
        let userDatas = JSON.parse(CryptoJS.AES.decrypt(user_session, 'session').toString(CryptoJS.enc.Utf8));
        db.collection('products').doc(userDatas.productId).set({ 
            users : {
                [data_key]: {
                    isActive: status
                }
            }
        }, 
        { merge: true });
    });

    socket.on("delete_user_req", (data_key, user_session) => 
    {
        let userDatas = JSON.parse(CryptoJS.AES.decrypt(user_session, 'session').toString(CryptoJS.enc.Utf8));
        db.collection('products').doc(userDatas.productId).set(
        { 
            users : {
                [data_key]: admin.firestore.FieldValue.delete()
            }
        }, 
        { merge: true }
        ).then(() => 
        {
            socket.emit("deleted_user");
        });
    });

    socket.on("req_edit_email", (email, user_session, password) => 
    {
        if(user_session !== null)
        {
            let userDatas = JSON.parse(CryptoJS.AES.decrypt(user_session, 'session').toString(CryptoJS.enc.Utf8));
            const products = db.collection('products');
            let error = false;
            db.collection('products').doc(userDatas.productId).get().then(doc => {
                data = doc.data();
                if(typeof(data["admin"][email]) == "undefined" &&  typeof(data["users"][email]) == "undefined")
                {
                    if(hasher.verify(password, data[userDatas.type][userDatas.email]["pass"]))
                    {
                        let encrypted_email = JSON.stringify({
                            new_email:email,
                            old_email: userDatas.email
                        })

                        encrypted_email = CryptoJS.AES.encrypt(encrypted_email, 'session').toString();
                        
                        const uri_email = encodeURIComponent(encrypted_email);
                        

                        const mailOptions = {
                            from: 'anisrouane2@gmail.com',
                            to: email,
                            subject: "Changement d'email INANNY",
                            html: "<div>"+
                                        "<h1>Cher "+data[userDatas.type][userDatas.email].lname+" "+data[userDatas.type][userDatas.email].fname+"<h1>" +
                                        "<h2>Nous vous avons envoyé cet email pour confirmer le changement "+
                                        "que vous avez demandé(e).</h2>" +
                                        "<p>Veuillez cliquer sur le lien suivant pour confirmer votre nouvel email" +
                                        "<br><br>" +
                                        "<a href='http://localhost:3000/verification/email/ " + uri_email + "'>"+
                                        "Cliquez ici pour confirmer</a>"+
                                        "<br><br>"+
                                        "Nous souhaitons une bonne santé à votre enfant, insha'Allah."+
                                "</div>"
                        };

                        transporter.sendMail(mailOptions, (error, info) =>
                        {
                            if (error) 
                            {
                                console.log(error);
                                socket.emit("unexpected_error");
                            } 
                            else 
                            {
                                socket.emit("edit_email_success");
                            }
                        })
                    }
                    else 
                    {
                        socket.emit("error_edit_email", {email:null, confirmpass:"Mot de passe incorrect"});
                    }
                }
                else 
                {
                    socket.emit("error_edit_email", {email:"Email déjà utilisé par un autre utilisateur", confirmpass:null});
                }
            })
        }
    });

    socket.on("set_new_email", (user_session, verkey) => {
        if(user_session !== null)
        {
            let userDatas = JSON.parse(CryptoJS.AES.decrypt(user_session, 'session').toString(CryptoJS.enc.Utf8));
            const new_email = decodeURIComponent(verkey).trim();
            const decrypted_email = JSON.parse(CryptoJS.AES.decrypt(new_email, 'session').toString(CryptoJS.enc.Utf8));
            db.collection('products').doc(userDatas.productId).get().then(doc => {
                data = doc.data();

                if(typeof(data["admin"][decrypted_email.old_email]) != "undefined")
                {
                    
                    new_session = {
                        email: decrypted_email.new_email,
                        productId: userDatas.productId,
                        type: "admin"
                    }
                    
                    let new_user = {};
                    new_user[decrypted_email.new_email] = {};
                    new_user[decrypted_email.new_email]["fname"] = data["admin"][decrypted_email.old_email].fname;
                    new_user[decrypted_email.new_email]["lname"] = data["admin"][decrypted_email.old_email].lname;
                    new_user[decrypted_email.new_email]["pnum"] = data["admin"][decrypted_email.old_email].pnum;
                    new_user[decrypted_email.new_email]["pass"] = data["admin"][decrypted_email.old_email].pass;
                    db.collection('products').doc(userDatas.productId).set(
                    {
                        "admin": new_user    
                    },{merge:true}).then(() => {
                        db.collection('products').doc(userDatas.productId).set(
                        { 
                            admin : {
                                [decrypted_email.old_email]: admin.firestore.FieldValue.delete()
                            }
                        }, 
                        { merge: true }).then(() => {
                            socket.emit("new_email_success", CryptoJS.AES.encrypt(JSON.stringify(new_session), 
                                        "session").toString());
                        })
                    })
                }
                else if(typeof(data["users"][decrypted_email.old_email]) != "undefined")
                {
                    
                    new_session = {
                        email: decrypted_email.new_email,
                        productId: userDatas.productId,
                        type: "users"
                    }
                    
                    let new_user = {};
                    new_user[decrypted_email] = {};
                    new_user[decrypted_email.new_email] = {};
                    new_user[decrypted_email.new_email]["fname"] = data["users"][decrypted_email.old_email].fname;
                    new_user[decrypted_email.new_email]["lname"] = data["users"][decrypted_email.old_email].lname;
                    new_user[decrypted_email.new_email]["pnum"] = data["users"][decrypted_email.old_email].pnum;
                    new_user[decrypted_email.new_email]["pass"] = data["users"][decrypted_email.old_email].pass;
                    new_user[decrypted_email.new_email]["isActive"] = data["users"][decrypted_email.old_emaill].isActive;
                    new_user[decrypted_email.new_email]["addDate"] = data["users"][decrypted_email.old_email].addDate;
                    db.collection('products').doc(userDatas.productId).set(
                    {
                        "users": new_user    
                    },{merge:true}).then(() => {
                        db.collection('products').doc(userDatas.productId).set(
                        { 
                            users : {
                                [decrypted_email.old_email]: admin.firestore.FieldValue.delete()
                            }
                        }, 
                        { merge: true }).then(() => {
                            socket.emit("new_email_success", CryptoJS.AES.encrypt(JSON.stringify(new_session), 
                                        "session").toString());
                        })
                    })
                }
            })
            
        }
    });

    socket.on("set_new_pn", (pnum, user_session, confirmpass) => {
        if(user_session !== null)
        {
            let userDatas = JSON.parse(CryptoJS.AES.decrypt(user_session, 'session').toString(CryptoJS.enc.Utf8));
            const decrypted_pn = pnum
            db.collection('products').doc(userDatas.productId).get().then(doc => {
                data = doc.data();

                if(typeof(data["admin"][userDatas.email]) != "undefined")
                {
                    if(hasher.verify(confirmpass, data["admin"][userDatas.email]["pass"]))
                    {
                        let new_user = {};
                        new_user[userDatas.email] = {};
                        new_user[userDatas.email]["fname"] = data["admin"][userDatas.email].fname;
                        new_user[userDatas.email]["lname"] = data["admin"][userDatas.email].lname;
                        new_user[userDatas.email]["pnum"] = decrypted_pn;
                        new_user[userDatas.email]["pass"] = data["admin"][userDatas.email].pass;
                        db.collection('products').doc(userDatas.productId).set(
                        {
                            admin : {
                                [userDatas.email]: admin.firestore.FieldValue.delete()
                            }
                            
                        },{merge:true}).then(() => {
                            db.collection('products').doc(userDatas.productId).set(
                            { 
                                "admin": new_user   
                            }, 
                            { merge: true }).then(() => {
                                socket.emit("new_pnum_success");
                            })
                        })
                    }
                    else 
                    {
                        socket.emit("error_edit_pnum", {pnum:null, confirmpass:"Mot de passe incorrect"});
                    }
                }
                else if(typeof(data["users"][userDatas.email]) != "undefined")
                {
                    if(hasher.verify(confirmpass, data["users"][userDatas.email]["pass"]))
                    {
                        let new_user = {};
                        new_user[userDatas.email] = {};
                        new_user[userDatas.email]["fname"] = data["users"][userDatas.email].fname;
                        new_user[userDatas.email]["lname"] = data["users"][userDatas.email].lname;
                        new_user[userDatas.email]["pnum"] = decrypted_pn;
                        new_user[userDatas.email]["pass"] = data["users"][userDatas.email].pass;
                        new_user[userDatas.email]["isActive"] = data["users"][userDatas.email].isActive;
                        new_user[userDatas.email]["addDate"] = data["users"][userDatas.email].addDate;
                        db.collection('products').doc(userDatas.productId).set(
                        {
                            users : {
                                [userDatas.email]: admin.firestore.FieldValue.delete()
                            }   
                        },{merge:true}).then(() => {
                            db.collection('products').doc(userDatas.productId).set(
                            { 
                                "users": new_user 
                            }, 
                            { merge: true }).then(() => {
                                socket.emit("new_pnum_success");
                            })
                        });
                    }
                    else 
                    {
                        socket.emit("error_edit_pnum", {pnum:null, confirmpass:"Mot de passe incorrect"});
                    }
                }
            })
        }
    });

    socket.on("set_new_pass", (new_pass, user_session, confirmpass) => {
        if(user_session !== null)
        {
            let userDatas = JSON.parse(CryptoJS.AES.decrypt(user_session, 'session').toString(CryptoJS.enc.Utf8));
            const encrypted_pass = hasher.generate(new_pass);
            db.collection('products').doc(userDatas.productId).get().then(doc => {
                data = doc.data();

                if(typeof(data["admin"][userDatas.email]) != "undefined")
                {
                    if(hasher.verify(confirmpass, data["admin"][userDatas.email]["pass"]))
                    {
                        let new_user = {};
                        new_user[userDatas.email] = {};
                        new_user[userDatas.email]["fname"] = data["admin"][userDatas.email].fname;
                        new_user[userDatas.email]["lname"] = data["admin"][userDatas.email].lname;
                        new_user[userDatas.email]["pnum"] = data["admin"][userDatas.email].pnum;
                        new_user[userDatas.email]["pass"] = encrypted_pass;
                        db.collection('products').doc(userDatas.productId).set(
                        {
                            admin : {
                                [userDatas.email]: admin.firestore.FieldValue.delete()
                            }
                            
                        },{merge:true}).then(() => {
                            db.collection('products').doc(userDatas.productId).set(
                            { 
                                "admin": new_user   
                            }, 
                            { merge: true }).then(() => {
                                socket.emit("new_pass_success");
                            })
                        })
                    }
                    else 
                    {
                        socket.emit("error_edit_pass", {pass:null, confirmpass:"Mot de passe incorrect"});
                    }
                }
                else if(typeof(data["users"][userDatas.email]) != "undefined")
                {
                    if(hasher.verify(confirmpass, data["users"][userDatas.email]["pass"]))
                    {
                        let new_user = {};
                        new_user[userDatas.email] = {};
                        new_user[userDatas.email]["fname"] = data["users"][userDatas.email].fname;
                        new_user[userDatas.email]["lname"] = data["users"][userDatas.email].lname;
                        new_user[userDatas.email]["pnum"] = data["users"][userDatas.email].pnum;
                        new_user[userDatas.email]["pass"] = encrypted_pass;
                        new_user[userDatas.email]["isActive"] = data["users"][userDatas.email].isActive;
                        new_user[userDatas.email]["addDate"] = data["users"][userDatas.email].addDate;
                        db.collection('products').doc(userDatas.productId).set(
                        {
                            users : {
                                [userDatas.email]: admin.firestore.FieldValue.delete()
                            }   
                        },{merge:true}).then(() => {
                            db.collection('products').doc(userDatas.productId).set(
                            { 
                                "users": new_user 
                            }, 
                            { merge: true }).then(() => {
                                socket.emit("new_ass_success");
                            })
                        });
                    }
                    else 
                    {
                        socket.emit("error_edit_pass", {pass:null, confirmpass:"Mot de passe incorrect"});
                    }
                }
            })
        }
    });
});

server.listen(port, () => 
{
    console.log("server on: "+port);
});
