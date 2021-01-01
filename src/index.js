const { app, shell, BrowserWindow } = require('electron');
const path = require('path');
const { dialog, ipcMain } = require('electron')
const storage = require('electron-json-storage');
const fs = require("fs");

let mainWindow = null

// ---------- DATABASE INFOS
const db = require('electron-db');
const { fstat } = require('fs');
let pathtodatabases = null
let databasesdirectory = undefined
const db_vendas_name = "vendas"
const db_vendedores_name = "vendedores"
const db_lucros_name = "lucros"
const db_gastos_name = "gastos"
const db_estoque_name = "estoque"
const db_categorias_name = "categorias"

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    },
    backgroundColor: '#000000',
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // read config file
  storage.get('databasesdirectory', function (error, data) {
    if (error) { console.log(error); }
    databasesdirectory = data.value
    mainWindow.maximize();
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    APP_STARTED()
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


// -------------------------------------------------------------------------------------------------------
async function option_changefolder() {
  mainWindow.webContents.executeJavaScript('alertbox("Selecione a pasta para salvamento dos bancos de dados -- A janela de seleção está aberta --")');
  var folderselected = await dialog.showOpenDialog({
    title: 'Selecionar a pasta do Banco de Dados',
    properties: ['openDirectory']
  });

  if (folderselected.canceled == true) {
    db_console_log("option_changefolder = folder not selected by user input")
  } else {
    // Write on config
    storage.set('databasesdirectory', { value: folderselected.filePaths[0] })
    databasesdirectory = folderselected.filePaths[0]
    pathtodatabases = path.join(databasesdirectory, '')
    db_console_log("option_changefolder = new folder - " + folderselected.filePaths[0])
    mainWindow.webContents.executeJavaScript('bodyloaded()');
  }
  APP_STARTED()
  return true
}

function checkdatabasesonstart() {
  // ------- CHECK DATABASES
  db_console_log("checkdatabasesonstart = checking databases")

  // vendas
  if (db.tableExists(db_vendas_name, pathtodatabases)) {
    db_console_log("database vendas already exists")
  } else {
    db_console_log("database vendas not exists, creating it...")
    db.createTable(db_vendas_name, pathtodatabases, (succ, msg) => {
      db_console_log("success = ", succ)
    })
  }

  // vendedores
  if (db.tableExists(db_vendedores_name, pathtodatabases)) {
    db_console_log("database vendedores already exists")
  } else {
    db_console_log("database vendedores not exists, creating it...")
    db.createTable(db_vendedores_name, pathtodatabases, (succ, msg) => {
      db_console_log("success = ", succ)
    })
  }

  // lucro
  if (db.tableExists(db_lucros_name, pathtodatabases)) {
    db_console_log("database lucro already exists")
  } else {
    db_console_log("database lucro not exists, creating it...")
    db.createTable(db_lucros_name, pathtodatabases, (succ, msg) => {
      db_console_log("success = ", succ)
    })
  }

  // gastos
  if (db.tableExists(db_gastos_name, pathtodatabases)) {
    db_console_log("database gastos already exists")
  } else {
    db_console_log("database gastos not exists, creating it...")
    db.createTable(db_gastos_name, pathtodatabases, (succ, msg) => {
      db_console_log("success = ", succ)
    })
  }

  // estoque
  if (db.tableExists(db_estoque_name, pathtodatabases)) {
    db_console_log("database estoque already exists")
  } else {
    db_console_log("database estoque not exists, creating it...")
    db.createTable(db_estoque_name, pathtodatabases, (succ, msg) => {
      db_console_log("success = ", succ)
    })
  }

  // categorias
  if (db.tableExists(db_categorias_name, pathtodatabases)) {
    db_console_log("database categorias already exists")
  } else {
    db_console_log("database categorias not exists, creating it...")
    db.createTable(db_categorias_name, pathtodatabases, (succ, msg) => {
      db_console_log("success = ", succ)
    })
  }
}

function db_console_log(text) {
  console.log(text)
  stringtoexecute = "console_log('db.log -- " + text + "')"
  mainWindow.webContents.executeJavaScript(stringtoexecute)
}

function APP_STARTED() {
  var isoktorun = false
  // check if folder location exists
  if (databasesdirectory == null || databasesdirectory == undefined || databasesdirectory == 'undefined') {
    var check = option_changefolder()
  } else {
    pathtodatabases = path.join(databasesdirectory, '')
    if (fs.existsSync(pathtodatabases)) {
      isoktorun = true
      console.log('path to database exists')
    } else {
      console.log('path to database do not exists... selecting it')
      var check = option_changefolder()
    }
  }

  if (isoktorun) {
    mainWindow.webContents.executeJavaScript('bodyloaded()');

    checkdatabasesonstart()
    // Requests from main.js
    //venda
    ipcMain.on('db_addnewvenda', (event, args) => {
      to_return = db_addnewvenda(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_editvenda', (event, args) => {
      to_return = db_editvenda(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_gettoeditvenda', (event, args) => {
      to_return = db_gettoeditvenda(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_deletevenda', (event, args) => {
      to_return = db_deletevenda(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_getallvendas', (event, args) => {
      to_return = db_getallvendas(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_getdayvendas', (event, args) => {
      to_return = db_getdayvendas(args)
      event.returnValue = to_return
    })
    //vendedor
    ipcMain.on('db_getallvendedores', (event, args) => {
      to_return = db_getallvendedores()
      event.returnValue = to_return
    })
    ipcMain.on('db_savenewvendedor', (event, args) => {
      to_return = db_savenewvendedor(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_gettoeditvendedor', (event, args) => {
      to_return = db_gettoeditvendedor(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_editvendedor', (event, args) => {
      to_return = db_editvendedor(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_deletevendedor', (event, args) => {
      to_return = db_deletevendedor(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_gethistoricovendedor', (event, args) => {
      to_return = db_gethistoricovendedor(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_getvendedorbykey', (event, args) => {
      to_return = db_getvendedorbykey(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_getkeybynamevendedor', (event, args) => {
      to_return = db_getkeybynamevendedor(args)
      event.returnValue = to_return
    })
    //lucro
    ipcMain.on('db_addlucro', (event, args) => {
      to_return = db_addlucro(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_editlucro', (event, args) => {
      to_return = db_editlucro(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_getdaylucros', (event, args) => {
      to_return = db_getdaylucros(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_gettoeditlucro', (event, args) => {
      to_return = db_gettoeditlucro(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_deletelucro', (event, args) => {
      to_return = db_deletelucro(args)
      event.returnValue = to_return
    })
    //gasto
    ipcMain.on('db_addgasto', (event, args) => {
      to_return = db_addgasto(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_editgasto', (event, args) => {
      to_return = db_editgasto(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_getdaygastos', (event, args) => {
      to_return = db_getdaygastos(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_gettoeditgasto', (event, args) => {
      to_return = db_gettoeditgasto(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_deletegasto', (event, args) => {
      to_return = db_deletegasto(args)
      event.returnValue = to_return
    })
    //estoque
    ipcMain.on('db_addproduto', (event, args) => {
      to_return = db_addproduto(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_editproduto', (event, args) => {
      to_return = db_editproduto(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_gettoeditproduto', (event, args) => {
      to_return = db_gettoeditproduto(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_deleteproduto', (event, args) => {
      to_return = db_deleteproduto(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_getprodutobykey', (event, args) => {
      to_return = db_getprodutobykey(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_getkeybyproductname', (event, args) => {
      to_return = db_getkeybyproductname(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_getallproducts', (event, args) => {
      to_return = db_getallproducts(args)
      event.returnValue = to_return
    })
    //categorias
    ipcMain.on('db_getallcategorias', (event, args) => {
      to_return = db_getallcategorias(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_addcategoria', (event, args) => {
      to_return = db_addcategoria(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_getcategoriabykey', (event, args) => {
      to_return = db_getcategoriabykey(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_editcategoria', (event, args) => {
      to_return = db_editcategoria(args)
      event.returnValue = to_return
    })
    ipcMain.on('db_deletecategoria', (event, args) => {
      to_return = db_deletecategoria(args)
      event.returnValue = to_return
    })
    // outros
    ipcMain.on('option_changefolder', (event, args) => {
      to_return = option_changefolder()
      event.returnValue = true
    })
    ipcMain.on('quit_application', (event, args) => {
      app.quit()
      event.returnValue = true
    })
    ipcMain.on('restart_application', (event, args) => {
      app.quit()
      app.relaunch();
      event.returnValue = true
    })
    ipcMain.on('minimize_application', (event, args) => {
      mainWindow.minimize();
      event.returnValue = true
    })
    ipcMain.on('maximize_application', (event, args) => {
      mainWindow.maximize();
      event.returnValue = true
    })
    ipcMain.on('option_developerconsole', (event, args) => {
      mainWindow.toggleDevTools();
      event.returnValue = true
    })
    ipcMain.on('openbrowser', (event, args) => {
      shell.openExternal(args)
      event.returnValue = true
    })
    ipcMain.on('openpathtodatabase', (event, args) => {
      shell.openPath(pathtodatabases)
      event.returnValue = true
    })

  }
}


// ================================  ESTOQUE ====================
function db_addproduto(obj_newproduto) {
  if (db.valid(db_estoque_name, pathtodatabases)) {
    db.insertTableContent(db_estoque_name, pathtodatabases, obj_newproduto, (succ, msg) => {
      db_console_log("db_addproduto = " + succ)
    })
  } else {
    db_console_log("db_addproduto = invalid db")
  }
  return true
}

function db_editproduto(obj_produtoedited) {
  let where = {
    "id": parseInt(obj_produtoedited.id)
  };

  let set = {
    "nome": obj_produtoedited.nome,
    "categoria": obj_produtoedited.categoria,
    "descricao": obj_produtoedited.descricao,
    "valorcompra": obj_produtoedited.valorcompra,
    "valorvenda": obj_produtoedited.valorvenda,
    "opcoes": obj_produtoedited.opcoes,
    "quantidade": obj_produtoedited.quantidade
  }

  db.updateRow(db_estoque_name, pathtodatabases, where, set, (succ, msg) => {
    // succ - boolean, tells if the call is successful
    db_console_log("db_editproduto = " + succ)
  });

  return true

}

function db_gettoeditproduto(id) {
  //Get row or rows that matched the given condition(s) in WHERE argument
  let where = {
    id: parseInt(id)
  }
  produtotoedit = []
  db.getRows(db_estoque_name, pathtodatabases, where, (succ, result) => {
    // succ - boolean, tells if the call is successful
    db_console_log("db_gettoeditproduto = " + succ)
    pacienttoedit = result[0]
  })
  return pacienttoedit
}

function db_deleteproduto(produtoid) {
  where = { 'id': parseInt(produtoid) }
  db.deleteRow(db_estoque_name, pathtodatabases, where, (succ, msg) => {
    db_console_log("db_deleteproduto = " + succ)
  });
  return true
}

function db_getallproducts() {
  allproducts = []
  db.getAll(db_estoque_name, pathtodatabases, (succ, data) => {
    allproducts = data
    db_console_log("db_getallproducts = " + succ)
  })
  return allproducts
}

function db_getprodutobykey(productkey) {
  //Get row or rows that matched the given condition(s) in WHERE argument
  let where = {
    id: parseInt(productkey)
  }
  var product = []
  db.getRows(db_estoque_name, pathtodatabases, where, (succ, result) => {
    // succ - boolean, tells if the call is successful
    product = result[0]
    if (product == undefined) {
      product = new Object()
      product.nome = "Produto Não Encontrado"
      product.descricao = ' - '
      product.valorcompra = 0
      product.valorvenda = 0
      product.obs = " - "
      product.categoria = 'Outras'
      product.quantidade = 0
      product.id = 0
    }
    db_console_log("db_getproductbykey = " + succ)
  })
  return product
}

function db_getkeybyproductname(productname) {
  //Get row or rows that matched the given condition(s) in WHERE argument
  let where = {
    nome: productname
  }
  key = "undefined"
  db.getRows(db_estoque_name, pathtodatabases, where, (succ, result) => {
    // succ - boolean, tells if the call is successful
    key = result[0].id
    db_console_log("db_getkeybyproductname = " + succ)
  })
  return key
}



// ================================  CATEGORIAS  ====================
function db_getallcategorias() {
  allcategorias = []
  db.getAll(db_categorias_name, pathtodatabases, (succ, data) => {
    allcategorias = data
    db_console_log("db_getallcategorias = " + succ)
  })
  return allcategorias
}

function db_addcategoria(obj_newcategoria) {
  if (db.valid(db_categorias_name, pathtodatabases)) {
    db.insertTableContent(db_categorias_name, pathtodatabases, obj_newcategoria, (succ, msg) => {
      db_console_log("db_addcategoria = " + succ)
    })
  } else {
    db_console_log("db_addcategoria = invalid db")
  }
  return true
}

function db_getcategoriabykey(categoriakey) {
  //Get row or rows that matched the given condition(s) in WHERE argument
  let where = {
    id: parseInt(categoriakey)
  }
  var categoria = []
  db.getRows(db_categorias_name, pathtodatabases, where, (succ, result) => {
    // succ - boolean, tells if the call is successful
    categoria = result[0]
    if (categoria == undefined) {
      categoria = new Object()
      categoria.nome = "ERROR CATEGORIA"
    }
    //db_console_log("db_getcategoriabykey = " + succ)
  })
  return categoria
}

function db_editcategoria(obj_categoriaedited) {
  let where = {
    "id": parseInt(obj_categoriaedited.id)
  };

  let set = {
    "nome": obj_categoriaedited.nome,
  }

  db.updateRow(db_categorias_name, pathtodatabases, where, set, (succ, msg) => {
    // succ - boolean, tells if the call is successful
    db_console_log("db_editcategorias = " + succ)
  });

  return true

}

function db_deletecategoria(categoriaid) {
  where = { 'id': parseInt(categoriaid) }
  db.deleteRow(db_categorias_name, pathtodatabases, where, (succ, msg) => {
    db_console_log("db_deletecategoria = " + succ)
  });
  return true
}


// ================================  VENDAS ====================
function db_addnewvenda(obj_newvenda) {
  if (db.valid(db_vendas_name, pathtodatabases)) {
    db.insertTableContent(db_vendas_name, pathtodatabases, obj_newvenda, (succ, msg) => {
      db_console_log("db_addnewvenda = " + succ)
    })
  } else {
    db_console_log("db_addnewvenda = invalid db")
  }
  return true
}

function db_editvenda(obj_vendaedited) {
  let where = {
    "id": parseInt(obj_vendaedited.id)
  };

  let set = {
    "key_vendedor": obj_vendaedited.key_vendedor,
    "key_product": obj_vendaedited.key_product,
    "datetime": obj_vendaedited.datetime,
    "valor": obj_vendaedited.valor,
    "formapag": obj_vendaedited.formapag,
    "obs": obj_vendaedited.obs,
    "status": obj_vendaedited.status
  }

  db.updateRow(db_vendas_name, pathtodatabases, where, set, (succ, msg) => {
    // succ - boolean, tells if the call is successful
    db_console_log("db_editvenda = " + succ)
  });

  return true

}

function db_gettoeditvenda(id) {
  //Get row or rows that matched the given condition(s) in WHERE argument
  let where = {
    id: parseInt(id)
  }
  vendatoedit = []
  db.getRows(db_vendas_name, pathtodatabases, where, (succ, result) => {
    // succ - boolean, tells if the call is successful
    db_console_log("db_gettoeditvenda = " + succ)
    vendatoedit = result[0]
  })
  return vendatoedit
}

function db_deletevenda(vendaid) {
  where = { 'id': parseInt(vendaid) }
  db.deleteRow(db_vendas_name, pathtodatabases, where, (succ, msg) => {
    db_console_log("db_deletevenda = " + succ)
  });
  return true
}

function db_getallvendas() {
  allvendas = []
  db.getAll(db_vendas_name, pathtodatabases, (succ, data) => {
    allvendas = data
    db_console_log("db_getallvendas = " + succ)
  })
  return allvendas
}

function db_getdayvendas(datetogetdata) {
  vendasthisday = []
  db.search(db_vendas_name, pathtodatabases, 'datetime', datetogetdata, (succ, result) => {
    vendasthisday = result
    //db_console_log("db_getdaylucros = " + succ)
  })
  return vendasthisday
}


// ================================  LUCRO ====================
function db_addlucro(obj_lucro) {
  if (db.valid(db_lucros_name, pathtodatabases)) {
    db.insertTableContent(db_lucros_name, pathtodatabases, obj_lucro, (succ, msg) => {
      db_console_log("db_addlucro = " + succ)
    })
  } else {
    db_console_log("db_addlucro = db not valid")
  }
  return true
}

function db_editlucro(obj_lucroedit) {
  let where = {
    "id": parseInt(obj_lucroedit.id)
  };

  let set = {
    "data": obj_lucroedit.data,
    "valor": obj_lucroedit.valor,
    "movimentacao": obj_lucroedit.movimentacao,
    "responsavel": obj_lucroedit.responsavel,
    "descricao": obj_lucroedit.descricao,
    "showcontrole": obj_lucroedit.showcontrole
  }

  db.updateRow(db_lucros_name, pathtodatabases, where, set, (succ, msg) => {
    db_console_log("db_editlucro = " + succ)
  });

  return true
}

function db_getdaylucros(datetogetdata) {
  // OBJECT LUCRO: data, valor, movimentacao, responsavel, descricao,showcontrole, id
  let where = {
    data: datetogetdata
  }
  lucrothisday = []
  db.getRows(db_lucros_name, pathtodatabases, where, (succ, result) => {
    // succ - boolean, tells if the call is successful
    lucrothisday = result
    //db_console_log("db_getdaylucros = " + succ)
  })
  return lucrothisday
}

function db_gettoeditlucro(lucroid) {
  //Get row or rows that matched the given condition(s) in WHERE argument
  let where = {
    id: parseInt(lucroid)
  }
  lucrotoedit = []
  db.getRows(db_lucros_name, pathtodatabases, where, (succ, result) => {
    // succ - boolean, tells if the call is successful
    lucrotoedit = result[0]
    db_console_log("db_gettoeditlucro = " + succ)
  })
  return lucrotoedit
}

function db_deletelucro(lucroid) {
  where = { 'id': parseInt(lucroid) }
  db.deleteRow(db_lucros_name, pathtodatabases, where, (succ, msg) => {
    db_console_log("db_deletelucro = " + succ)
  });
  return true
}


// ================================  GASTO ====================
function db_addgasto(obj_gasto) {
  if (db.valid(db_gastos_name, pathtodatabases)) {
    db.insertTableContent(db_gastos_name, pathtodatabases, obj_gasto, (succ, msg) => {
      db_console_log("db_addgasto = " + succ)
    })
  } else {
    db_console_log("db_addgasto = db invalid")
  }
  return true
}

function db_editgasto(obj_gastoedit) {
  let where = {
    "id": parseInt(obj_gastoedit.id)
  };

  let set = {
    "data": obj_gastoedit.data,
    "valor": obj_gastoedit.valor,
    "movimentacao": obj_gastoedit.movimentacao,
    "responsavel": obj_gastoedit.responsavel,
    "descricao": obj_gastoedit.descricao,
    "showcontrole": obj_gastoedit.showcontrole
  }

  db.updateRow(db_gastos_name, pathtodatabases, where, set, (succ, msg) => {
    db_console_log("db_editgasto = " + succ)
  });

  return true
}

function db_getdaygastos(datetogetdata) {
  // OBJECT LUCRO: data, valor, movimentacao, responsavel, descricao,showcontrole, id
  let where = {
    data: datetogetdata
  }
  gastothisday = []
  db.getRows(db_gastos_name, pathtodatabases, where, (succ, result) => {
    // succ - boolean, tells if the call is successful
    gastothisday = result
    //db_console_log("db_getdaygastos = " + succ)
  })
  return gastothisday
}

function db_gettoeditgasto(gastoid) {
  //Get row or rows that matched the given condition(s) in WHERE argument
  let where = {
    id: parseInt(gastoid)
  }
  gastotoedit = []
  db.getRows(db_gastos_name, pathtodatabases, where, (succ, result) => {
    gastotoedit = result[0]
    db_console_log("db_gettoeditgasto = " + succ)
  })
  return gastotoedit
}

function db_deletegasto(gastoid) {
  where = { 'id': parseInt(gastoid) }
  db.deleteRow(db_gastos_name, pathtodatabases, where, (succ, msg) => {
    db_console_log("db_deletegasto = " + succ)
  });
  return true
}



// ================================  VENDEDOR ====================
function db_savenewvendedor(obj_newvendedor) {
  if (db.valid(db_vendedores_name, pathtodatabases)) {
    db.insertTableContent(db_vendedores_name, pathtodatabases, obj_newvendedor, (succ, msg) => {
      db_console_log("db_addvendedor = " + succ)
    })
  } else {
    db_console_log("db_addvendedor = invalid db")
  }
  return true
}

function db_editvendedor(obj_vendedoredited) {
  let where = {
    "id": parseInt(obj_vendedoredited.id)
  };

  let set = {
    "nome": obj_vendedoredited.nome,
    "telefone": obj_vendedoredited.telefone
  }

  db.updateRow(db_vendedores_name, pathtodatabases, where, set, (succ, msg) => {
    // succ - boolean, tells if the call is successful
    db_console_log("db_editvendedor = " + succ)
  });

  return true

}

function db_gettoeditvendedor(id) {
  //Get row or rows that matched the given condition(s) in WHERE argument
  let where = {
    id: parseInt(id)
  }
  vendedortoedit = []
  db.getRows(db_vendedores_name, pathtodatabases, where, (succ, result) => {
    // succ - boolean, tells if the call is successful
    db_console_log("db_gettoeditvendedor = " + succ)
    vendedortoedit = result[0]
  })
  return vendedortoedit
}

function db_deletevendedor(vendedorid) {
  where = { 'id': parseInt(vendedorid) }
  db.deleteRow(db_vendedores_name, pathtodatabases, where, (succ, msg) => {
    db_console_log("db_deletevendedor = " + succ)
  });
  return true
}

function db_getallvendedores() {
  allvendedores = []
  db.getAll(db_vendedores_name, pathtodatabases, (succ, data) => {
    allvendedores = data
    db_console_log("db_getallvendedores = " + succ)
  })
  return allvendedores
}

function db_gethistoricovendedor(id) {
  //Get row or rows that matched the given condition(s) in WHERE argument
  let where = {
    vendedor_key: String(id)
  }
  allvendas = []
  db.getRows(db_vendas_name, pathtodatabases, where, (succ, result) => {
    // succ - boolean, tells if the call is successful
    allvendas = result

    db_console_log("db_gethistoricovendedor = " + succ)
  })
  return allvendas
}

function db_getvendedorbykey(vendedorkey) {
  //Get row or rows that matched the given condition(s) in WHERE argument
  let where = {
    'id': parseInt(vendedorkey)
  }
  var vendedor = []
  db.getRows(db_vendedores_name, pathtodatabases, where, (succ, result) => {
    // succ - boolean, tells if the call is successful
    vendedor = result[0]
    if (vendedor == undefined) {
      vendedor = new Object()
      vendedor.nome = 'Vendedor não encontrado'
      vendedor.telefone = '555555555'
    }
    db_console_log("db_getvendedorbykey = " + succ)
  })
  return vendedor
}

function db_getkeybynamevendedor(vendedorname) {
  //Get row or rows that matched the given condition(s) in WHERE argument
  let where = {
    'nome': vendedorname
  }
  var key = 0
  db.getRows(db_vendedores_name, pathtodatabases, where, (succ, result) => {
    // succ - boolean, tells if the call is successful
    key = result[0].id
    db_console_log("db_getkeybyvendedorname = " + succ)
  })
  return parseInt(key)
}

