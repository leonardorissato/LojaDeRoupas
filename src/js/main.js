// OBJECT VENDA: key_vendedor, key_product, datetime, valor, formapag, obs, id
// OBJECT VENDEDOR: nome, telefone
// OBJECT PRODUTOS: nome, codigo, descricao, tamanho, grupo

const { ipcRenderer } = require('electron')
const { TouchBarOtherItemsProxy } = require('electron/main')
const weekdays = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado']

const categoria_todas_name = "Todas"

function bodyloaded() {
    console_log("body loaded")
    window.numberclicklogo = 0
    window.filterbydate = false
    window.metodopesquisacell = 3
    window.metodopesquisaestoquecell = 2

    //create300products()
    update_vendapage()

    const clock = new Clock({
        monthNames: [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro'
        ]
    });
    clock.start();
}

function console_log(log) {
    console.log(" --- " + log)
}

function create300products() {
    for (productnumber = 1; productnumber <= 600; productnumber++) {
        var options = []
        for (optionnumber = 1; optionnumber <= 5; optionnumber++) {
            thisoption = new Object()
            thisoption.opcao = 'Prod' + String(productnumber) + 'Opt' + String(optionnumber)
            thisoption.quantidade = '5'
            thisoption.codigo = String(productnumber) + String(optionnumber)

            options.push(thisoption)
        }
        var novoproduto = new Object();
        novoproduto.nome = "Produto " + String(productnumber)
        novoproduto.categoria = '1603177580995'
        novoproduto.descricao = 'descrição aleatória'
        novoproduto.valorcompra = '25.95'
        novoproduto.valorvenda = '35.99'
        novoproduto.opcoes = options

        check = ipcRenderer.sendSync('db_addproduto', novoproduto)
    }
}

//=====================================  TITLE BAR   =====================================================
function quit_application() {
    check = ipcRenderer.sendSync('quit_application', 'vazio')
}

function minimize_application() {
    check = ipcRenderer.sendSync('minimize_application', 'vazio')
}

function maximize_application() {
    check = ipcRenderer.sendSync('maximize_application', 'vazio')
}

function click_options() {
    if (document.getElementById("dropdown-content").style.display == 'block') {
        document.getElementById("dropdown-content").style.display = ''
    } else {
        document.getElementById("dropdown-content").style.display = 'block'
    }
}

function option_changefolder() {
    check = ipcRenderer.sendSync('option_changefolder', 'vazio')
}

function option_developerconsole() {
    check = ipcRenderer.sendSync('option_developerconsole', 'vazio')
}

function openpathtodatabase() {
    check = ipcRenderer.sendSync('openpathtodatabase', 'vazio')
}

function confirma_hora() {
    open_confirmahora()
}

function restart_application() {
    check = ipcRenderer.sendSync('restart_application', 'vazio')
}



//=====================================  NAVBAR   =====================================================
function click_home(where) {
    if (where == "home") {
        document.getElementById('page_venda').style.display = "block";
        document.getElementById('estoquepage').style.display = "none";
        document.getElementById('adminpage').style.display = "none";
        document.getElementById('topnav_home').className = "active"
        document.getElementById('topnav_estoque').className = ""
        document.getElementById('topnav_admin').className = ""
        update_vendapage()
    } else if (where == "estoque") {
        document.getElementById('page_venda').style.display = "none";
        document.getElementById('estoquepage').style.display = "block";
        document.getElementById('adminpage').style.display = "none";
        document.getElementById('topnav_home').className = ""
        document.getElementById('topnav_estoque').className = "active"
        document.getElementById('topnav_admin').className = ""
        update_estoquepage()
    } else if (where == "admin") {
        document.getElementById('page_venda').style.display = "none";
        document.getElementById('estoquepage').style.display = "none";
        document.getElementById('adminpage').style.display = "block";
        document.getElementById('topnav_home').className = ""
        document.getElementById('topnav_estoque').className = ""
        document.getElementById('topnav_admin').className = "active"
        update_adminpage()

    }

}

function selectorheadchanged() {
    update_adminpage()
}

function clicklogo() {
    window.numberclicklogo += 1;
    if (window.numberclicklogo == 7) {
        console_log("click logo 7")
    }
}





//=====================================  VENDA   =====================================================

function update_vendapage() {
    // set categorias
    if (true) {
        category_container = document.getElementById('venda_categorias_container')
        category_container.innerHTML = ''

        // ADD TODAS CATEGORIAS
        categorias_todas = document.createElement('div')
        categorias_todas.id = categoria_todas_name
        categorias_todas.className = 'categoriaselected'
        categorias_todas.onclick = function () {
            filterbycategory(categoria_todas_name)
        }
        paragraph_category = document.createElement('p')
        paragraph_category.textContent = categoria_todas_name
        categorias_todas.appendChild(paragraph_category)
        category_container.appendChild(categorias_todas)

        // ADD CATEGORIAS FROM DATABASE
        var allcategorias = ipcRenderer.sendSync('db_getallcategorias', 'vazio')
        allcategorias.forEach(categoria => {
            novacategoria = document.createElement('div')
            novacategoria.id = categoria.nome
            novacategoria.onclick = function () {
                filterbycategory(categoria.nome)
            }

            var paragraph_category = document.createElement('p')
            paragraph_category.textContent = categoria.nome
            novacategoria.appendChild(paragraph_category)

            category_container.appendChild(novacategoria)
        });
    }

    // set product table
    if (true) {
        console.log('start       - ', new Date().toISOString())
        // clear product table
        var table = document.getElementById("table_produtos");
        while (table.tBodies[0].rows.length > 0) {
            table.deleteRow(0)
        }
        console.log('beforeclear - ', new Date().toISOString())
        var allproducts = ipcRenderer.sendSync('db_getallproducts', 'vazio')
        console.log('before getw - ', new Date().toISOString())
        allproducts.sort((a, b) => (a.categoria > b.categoria) ? 1 : (a.categoria === b.categoria) ? ((a.nome > b.nome) ? 1 : -1) : -1)
        console.log('before sort - ', new Date().toISOString())
        counter = 0
        allproducts.forEach(produto => {
            counter += 1

            var lastrow = table.tBodies[0].rows.length
            var row = table.insertRow(lastrow);
            row.style.animation = 'insertrowanimation .3s ease'

            var cellid = row.insertCell(0);
            cellid.style = "display: none;"
            cellid.innerHTML = produto.id


            var cell_codigo = row.insertCell(1);
            var cell_categoria = row.insertCell(2);
            var cell_produto = row.insertCell(3);
            var cell_descricao = row.insertCell(4);
            var cell_qtdade = row.insertCell(5);
            var cell_valor = row.insertCell(6);
            var cell_addcart = row.insertCell(7);


            //get quantidade and códigos
            var codigo_todas = ""
            var quantidade_todas = 0
            produto.opcoes.forEach(opcao => {
                if (opcao.quantidade > 0) {
                    quantidade_todas += parseInt(opcao.quantidade)
                }
                codigo_todas += "," + opcao.codigo
            });


            cell_codigo.innerHTML = codigo_todas;
            cell_codigo.style = " display:none;"


            cell_categoria.innerHTML = ipcRenderer.sendSync('db_getcategoriabykey', produto.categoria).nome
            cell_categoria.style = "width: 15%;"
            cell_produto.innerHTML = produto.nome;
            cell_produto.style = "width: 25%;"
            cell_descricao.innerHTML = produto.descricao
            cell_descricao.style = "width: 35%;"



            cell_qtdade.innerHTML = quantidade_todas;
            cell_qtdade.style = "width: 10%;"
            cell_valor.innerHTML = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.valorvenda);
            cell_valor.style = "width: 15%;"

            var popover_id = "popover_" + String(produto.id)
            button_details = document.createElement('img')
            button_details.src = "./img/icon-details.png"
            button_details.className = 'bouncingbuttonicon'
            button_details.onclick = function () {
                getoptionsforproduct(popover_id)
            }
            cell_addcart.appendChild(button_details)

            div_tablecontainer = document.createElement('div')
            div_tablecontainer.id = popover_id
            cell_addcart.appendChild(div_tablecontainer)

            cell_addcart.style = "width: 15%;"
        });
        console.log('before each - ', new Date().toISOString())
    }

    // set vendedores name
    if (true) {
        var vendedorselector = document.getElementById('selectorvendedorcart')
        while (vendedorselector.options.length > 0) {
            vendedorselector.remove(0)
        }

        var allvendedores = ipcRenderer.sendSync('db_getallvendedores', 'vazio')
        allvendedores.forEach(vendedor => {
            var opt = document.createElement('option');
            opt.value = vendedor.id;
            opt.innerText = vendedor.nome;
            vendedorselector.appendChild(opt);
        });
    }

}

function getoptionsforproduct(popoverid) {
    var sameactual = false
    try {
        var actual = document.getElementsByClassName('popover_show')
        if (actual[0].id == popoverid) {
            sameactual = true
        }
        actual[0].className = 'popover_hidden'
    } catch (error) {
        //'nenhum selecionado ainda'
    }

    if (!sameactual) {
        clicked = document.getElementById(popoverid)
        clicked.innerHTML = ''
        clicked.className = 'popover_show'


        var divtable = document.getElementById(popoverid)
        var table = document.createElement('table')
        divtable.appendChild(table)

        idproduto = popoverid.split("_")[1]
        produto = ipcRenderer.sendSync('db_getprodutobykey', idproduto)

        opcoesforthis = produto.opcoes

        opcoesforthis.forEach(opcao => {
            var row = table.insertRow(0);
            row.style.animation = 'insertrowanimation 0.4s ease-in-out'

            var cellcodigo = row.insertCell(0);
            var celloption = row.insertCell(1);
            var cellqtdade = row.insertCell(2);
            var celladdcart = row.insertCell(3);

            if (parseInt(opcao.quantidade) < 1) {
                cellcodigo.style.color = 'red'
                celloption.style.color = 'red'
                cellqtdade.style.color = 'red'
            }

            celloption.innerText = opcao.opcao
            cellqtdade.innerText = opcao.quantidade
            cellcodigo.innerText = opcao.codigo

            var button_addcart = document.createElement('img')
            button_addcart.src = "./img/cart-add.png"
            button_addcart.className = 'bouncingbuttonicon'
            button_addcart.onclick = function () {
                addcart(produto, opcao)
            }
            celladdcart.appendChild(button_addcart)

        });
    }

}

function filterbycategory(category_name) {
    document.getElementById('searchproduto').value = ""

    // filter
    if (true) {
        var filter, table, tr, td, i, txtValue;
        if (category_name == categoria_todas_name) {
            filter = ''
        } else {
            filter = category_name.toUpperCase();
        }

        table = document.getElementById("table_produtos");
        tr = table.getElementsByTagName("tr");
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[2];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }

    // toggle active
    var currentactive = document.getElementsByClassName("categoriaselected");
    currentactive[0].className = currentactive[0].className = '';
    document.getElementById(category_name).className = 'categoriaselected'
}

function metodopesquisa(metodo) {
    document.getElementsByClassName('buttonpesquisaactive')[0].className = ""
    document.getElementById(metodo).className = 'buttonpesquisaactive'

    if (metodo == 'pesquisa_produto') {
        document.getElementById('searchproduto').placeholder = "Pesquisar por Produto"
        window.metodopesquisacell = 3
    }
    if (metodo == 'pesquisa_descricao') {
        document.getElementById('searchproduto').placeholder = "Pesquisar por Descrição"
        window.metodopesquisacell = 4
    }
    if (metodo == 'pesquisa_codigo') {
        document.getElementById('searchproduto').placeholder = "Pesquisar por Código"
        window.metodopesquisacell = 1
    }
}

function searchproduto() {
    // search
    if (true) {
        var input, filter, table, tr, td, i, txtValue;
        input = document.getElementById('searchproduto')
        filter = input.value.toUpperCase();

        table = document.getElementById("table_produtos");
        tr = table.getElementsByTagName("tr");
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[metodopesquisacell];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }

    // toggle active to todas
    var currentactive = document.getElementsByClassName("categoriaselected");
    currentactive[0].className = currentactive[0].className = '';
    document.getElementById(categoria_todas_name).className = 'categoriaselected'
}

function addcart(product, opcao) {
    // hide actual popover
    try {
        var actual = document.getElementsByClassName('popover_show')
        actual[0].className = 'popover_hidden'
    } catch (error) {
        a = 0
    }


    var id_qtdade_novoproduto = String(product.id) + '_' + opcao.opcao

    if (document.getElementById(id_qtdade_novoproduto) != null) {
        console_log('product already on cart, adding one more')
        qtdade_atual = parseInt(document.getElementById(id_qtdade_novoproduto).textContent)
        document.getElementById(id_qtdade_novoproduto).textContent = String(qtdade_atual + 1)
    } else {
        console_log('product not on cart, adding it ')

        table = document.getElementById('table_venda')

        var lastrowindex = table.tBodies[0].rows.length

        var row = table.insertRow(lastrowindex);
        row.style.animation = 'insertrowanimation 0.1s ease'

        var cellid = row.insertCell(0);
        cellid.style.display = 'none'
        cellid.innerHTML = product.id;

        var cellvalor = row.insertCell(1);
        cellvalor.style.display = 'none'
        cellvalor.innerHTML = product.valorvenda;

        var cell_qtdade = row.insertCell(2);
        var cell_produto = row.insertCell(3);
        var cell_valor = row.insertCell(4);
        var cell_delete = row.insertCell(5);

        cell_qtdade.style = "width:25%;  border-top-left-radius: 10px; border-bottom-left-radius: 10px;"
        cell_produto.style = "width:45%; font-size: .9vw;"
        cell_valor.style = "width:25%; font-size: 1vw;"
        cell_delete.style = "width:5%; border-top-right-radius: 10px; border-bottom-right-radius: 10px;"


        // add quantidade
        if (true) {
            button_minus = document.createElement('img')
            button_minus.src = "./img/icon-minus.png"
            button_minus.className = 'minuspluscart bouncingbuttonicon'
            button_minus.onclick = function () {
                qtdade_atual = parseInt(document.getElementById(id_qtdade_novoproduto).textContent)
                if (qtdade_atual > 1) {
                    document.getElementById(id_qtdade_novoproduto).textContent = String(qtdade_atual - 1)
                }
                update_cart_total()
            }
            cell_qtdade.appendChild(button_minus)

            button_qtdade = document.createElement('label')
            button_qtdade.innerText = '1'
            button_qtdade.id = id_qtdade_novoproduto
            cell_qtdade.appendChild(button_qtdade)

            button_plus = document.createElement('img')
            button_plus.src = "./img/icon-plus.png"
            button_plus.className = 'minuspluscart bouncingbuttonicon'
            button_plus.onclick = function () {
                qtdade_atual = parseInt(document.getElementById(id_qtdade_novoproduto).textContent)
                document.getElementById(id_qtdade_novoproduto).textContent = String(qtdade_atual + 1)
                update_cart_total()
            }
            cell_qtdade.appendChild(button_plus)
        }

        var productname = document.createElement('h')
        productname.innerText = product.nome
        cell_produto.appendChild(productname)
        var productoption = document.createElement('p')
        productoption.innerText = opcao.opcao
        cell_produto.appendChild(productoption)



        var product_valor = document.createElement('h1')
        product_valor.innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.valorvenda);;
        cell_valor.appendChild(product_valor)

        button_delete = document.createElement('img')
        button_delete.src = "./img/trash-can.png"
        button_delete.className = 'trashcancart bouncingbuttonicon'
        button_delete.onclick = function () {
            index = this.closest('tr').rowIndex
            table = document.getElementById('table_venda')
            table.deleteRow(index)

            update_cart_total()
        }
        cell_delete.appendChild(button_delete)

    }
    update_cart_total()
}

function addcartbycode(keypressed) {
    if (keypressed == 'Enter') {
        var inputcode = document.getElementById('addcartbycode').value
        document.getElementById('addcartbycode').value = ''

        console_log('addcartbycode  - ', inputcode)

        var produto_to_return = undefined
        var opcao_to_return = undefined

        var allproducts = ipcRenderer.sendSync('db_getallproducts', 'vazio')
        allproducts.forEach(produto => {
            var opcao = produto.opcoes.find(opcao => {
                if (parseInt(opcao.codigo) == parseInt(inputcode)) {
                    produto_to_return = produto
                    opcao_to_return = opcao
                    return true
                }
            })
        });
        if (produto_to_return != undefined && opcao_to_return != undefined) {
            addcart(produto_to_return, opcao_to_return)
        } else {
            document.getElementById('alert_product_notfound').className = 'alertproductnotfound_show'
            document.getElementById('productnotfound_code').textContent = inputcode
            setTimeout(function () { document.getElementById('alert_product_notfound').className = 'alertproductnotfound_hidden' }, 2500);
        }
    }
}

function finalizar_compra() {
    table_cart = document.getElementById('table_venda')

    var rowLength = table_cart.rows.length;

    var cart = []
    var valortotal = 0
    for (i = 0; i < rowLength; i++) {
        //gets cells of current row  
        var oCells = table_cart.rows.item(i).cells;

        var product_details = ipcRenderer.sendSync('db_getprodutobykey', oCells[0].textContent)

        var option_this_product = oCells[3].childNodes[1].textContent

        var obj_opcao = product_details.opcoes.find(obj => {
            return obj.opcao === option_this_product
        })

        var productinthisvenda = new Object()
        productinthisvenda.product_key = product_details.id
        productinthisvenda.product_codigo = obj_opcao.codigo
        productinthisvenda.product_name = product_details.nome
        productinthisvenda.product_opcoes = option_this_product
        productinthisvenda.product_categoria = ipcRenderer.sendSync('db_getcategoriabykey', product_details.categoria).nome
        productinthisvenda.valorcompra = product_details.valorcompra
        productinthisvenda.valorvenda = product_details.valorvenda
        productinthisvenda.quantidade = oCells[2].textContent

        cart.push(productinthisvenda)

        valortotal += parseFloat(product_details.valorvenda.replace(/,/g, '.')) * parseInt(oCells[2].textContent)
    }

    thisvenda = new Object()
    thisvenda.vendedor_name = document.getElementById('selectorvendedorcart').selectedOptions[0].text
    thisvenda.vendedor_key = document.getElementById('selectorvendedorcart').value
    thisvenda.datetime = new Date().toISOString()
    thisvenda.valortotal = valortotal.toFixed(2)
    thisvenda.status = 'Aguardando Confirmação'
    thisvenda.cart = cart

    if (cart.length == 0) {
        swal("Carrinho Vazio!", "Adicione algum produto para finalizar a compra", "warning");
    } else {
        confirma_venda(thisvenda)
    }
}

function cancelar_compra() {
    table_cart = document.getElementById('table_venda')
    var rowLength = table_cart.rows.length;
    for (i = 0; i < rowLength; i++) {
        //gets cells of current row  
        table_cart.deleteRow(0)
    }
    update_cart_total()
}

function update_cart_total() {
    table_cart = document.getElementById('table_venda')

    var rowLength = table_cart.rows.length;

    var valor_total = 0
    for (i = 0; i < rowLength; i++) {
        //gets cells of current row  
        var oCells = table_cart.rows.item(i).cells;
        var qtdadeofthisproduct = parseInt(oCells[2].textContent)
        var valorofthisproduct = parseFloat(oCells[1].textContent)
        var valortotalofthisproduct = qtdadeofthisproduct * valorofthisproduct
        valor_total += valortotalofthisproduct
    }
    str_valor_total = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor_total);
    document.getElementById('cart_valor_total').textContent = str_valor_total
}

// ************** CONFIRMA VENDA **********************
function confirma_venda(obj_venda) {
    document.getElementById('screen_confirmavenda').style.display = 'block'
    document.getElementById('form_confirmavenda').reset();
    document.getElementById('btn_excluirvenda').style.display = 'none'
    document.getElementById('btn_devolucao').style.display = 'none'
    document.getElementById('confirmavenda_vendedor').textContent = obj_venda.vendedor_name
    document.getElementById('confirmavenda_valortotal').textContent = obj_venda.valortotal
    document.getElementById('confirmavenda_status').textContent = obj_venda.status
    document.getElementById('header_venda').textContent = 'Confirmar Venda'

    // clear table
    table_confirma = document.getElementById('table_confirmavenda')
    while (table_confirma.rows.length > 1) {
        table_confirma.deleteRow(1)
    }

    // add each product
    var cart = obj_venda.cart
    cart.forEach(produto => {
        // check quantidade available
        var thisopcao_codigo = produto.product_codigo
        var thisproduto_parent = ipcRenderer.sendSync("db_getprodutobykey", produto.product_key)
        var thisopcao_opcao = thisproduto_parent.opcoes.find(obj => {
            return obj.codigo === String(thisopcao_codigo)
        })

        var quantidade_insuficiente = false
        if (parseInt(thisopcao_opcao.quantidade) < parseInt(produto.quantidade)) {
            quantidade_insuficiente = true
        }

        // add to table
        lastrow = table_confirma.rows.length
        row = table_confirma.insertRow(lastrow)

        cell_produto = row.insertCell(0)
        cell_opcao = row.insertCell(1)
        cell_qtdade = row.insertCell(2)
        cell_valor = row.insertCell(3)
        cell_total = row.insertCell(4)

        cell_produto.innerText = produto.product_name
        cell_opcao.innerText = produto.product_opcoes
        cell_qtdade.innerText = produto.quantidade
        if (quantidade_insuficiente) {
            var alert_qtdade = document.createElement('img');
            alert_qtdade.setAttribute("src", "./img/icon-alert.png");
            alert_qtdade.className = 'bouncingbuttonicon'
            alert_qtdade.title = "Quantidade Insuficiente em Estoque!! (Disponível = " + String(thisopcao_opcao.quantidade) + ")"
            cell_qtdade.appendChild(alert_qtdade)
        }

        cell_valor.innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.valorvenda);

        var total = parseFloat(produto.valorvenda) * parseInt(produto.quantidade)
        cell_total.innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);
    });

    // set vendaconfirmada
    buttonsubmit = document.getElementById('submit_confirmavenda')
    buttonsubmit.onclick = function () {
        venda_confirmada(obj_venda)
    }
}

function venda_confirmada(obj_venda) {
    textobs = document.getElementById('confirmavenda_obs').value
    textformapag = document.getElementById('confirmavenda_selectformapag').value

    if (textformapag == '') {
        alertbox('Selecione uma forma de pagamento!')
    } else {
        // add new values to object
        obj_venda.obs = textobs
        obj_venda.formapag = textformapag
        obj_venda.status = 'confirmada'

        //add to database
        check = ipcRenderer.sendSync('db_addnewvenda', thisvenda)

        swal("Venda Confirmada!", "Você pode acessar essa venda em seu histórico..", "success");

        // update quantity database
        thisvenda.cart.forEach(produto => {
            var producttoedit = ipcRenderer.sendSync("db_getprodutobykey", produto.product_key)
            optiontochange = producttoedit.opcoes.find(obj => {
                return obj.codigo === String(produto.product_codigo)
            })
            optiontochange.quantidade = String(parseInt(optiontochange.quantidade) - produto.quantidade)

            check = ipcRenderer.sendSync("db_editproduto", producttoedit)
        });

        //close confirmation screen and clean table cart
        document.getElementById('screen_confirmavenda').style.display = 'none'
        table_cart = document.getElementById('table_venda')
        var rowLength = table_cart.rows.length;
        for (i = 0; i < rowLength; i++) {
            //gets cells of current row  
            table_cart.deleteRow(0)
        }
        update_cart_total()
    }
}

function close_popupconfirmavenda() {
    document.getElementById('screen_confirmavenda').style.display = 'none'
}

function edit_venda(venda_id) {
    document.getElementById('screen_confirmavenda').style.display = 'block'
    document.getElementById('form_confirmavenda').reset();
    document.getElementById('btn_excluirvenda').style.display = 'none'
    document.getElementById('btn_devolucao').style.display = 'block'

    vendatoedit = ipcRenderer.sendSync('db_gettoeditvenda', venda_id)


    document.getElementById('confirmavenda_vendedor').textContent = vendatoedit.vendedor_name
    document.getElementById('confirmavenda_valortotal').textContent = vendatoedit.valortotal
    document.getElementById('confirmavenda_obs').value = vendatoedit.obs
    document.getElementById('confirmavenda_selectformapag').value = vendatoedit.formapag
    document.getElementById('confirmavenda_status').textContent = vendatoedit.status
    document.getElementById('header_venda').textContent = 'Detalhes da Venda'

    // clear table
    table_confirma = document.getElementById('table_confirmavenda')
    while (table_confirma.rows.length > 1) {
        table_confirma.deleteRow(1)
    }

    // add each product
    var cart = vendatoedit.cart
    cart.forEach(produto => {

        // add to table
        lastrow = table_confirma.rows.length
        row = table_confirma.insertRow(lastrow)

        cell_produto = row.insertCell(0)
        cell_opcao = row.insertCell(1)
        cell_qtdade = row.insertCell(2)
        cell_valor = row.insertCell(3)
        cell_total = row.insertCell(4)

        cell_produto.innerText = produto.product_name
        cell_opcao.innerText = produto.product_opcoes
        cell_qtdade.innerText = produto.quantidade

        cell_valor.innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.valorvenda);

        var total = parseFloat(produto.valorvenda) * parseInt(produto.quantidade)
        cell_total.innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);
    });

    // set vendaconfirmada
    document.getElementById('submit_confirmavenda').onclick = function () {
        close_popupconfirmavenda()
    }

    document.getElementById('btn_devolucao').onclick = function () {
        confirmadevolucao(vendatoedit)
    }
}

function confirmadevolucao(obj_venda) {
    console.log('devolucao')
    if (obj_venda.status == 'devolvida') {
        swal({
            title: "A venda já foi devolvida!",
            text: "Essa venda já foi devolvida para o estoque",
            icon: "warning",
        })
    } else {
        swal({
            title: "Devolução",
            text: "Após a devolução, os produtos irão retornar ao estoque e você poderá refazer a venda caso necessário",
            icon: "warning",
            buttons: ["Cancelar", "Concluir Devolução"],
        })
            .then((resultado) => {
                if (resultado) {
                    devolver(obj_venda)
                } else {
                    swal("A devolução não foi concluida", { icon: "error" })
                }
            });
    }
}

function devolver(obj_venda) {

    var allproductexists = ""

    // update quantity database
    obj_venda.cart.forEach(produto => {
        var producttoedit = ipcRenderer.sendSync("db_getprodutobykey", produto.product_key)

        //check if products exists on database
        if (producttoedit.id == 0) {
            allproductexists += "[" + produto.product_name + " - " + produto.product_opcoes + "]"
            // create a new product
            var thisoption = new Object()
            thisoption.opcao = produto.product_opcoes
            thisoption.quantidade = produto.quantidade
            thisoption.codigo = produto.product_codigo

            var optionarray = [thisoption]

            var novoproduto = new Object();
            novoproduto.nome = "000 - " + produto.product_name
            novoproduto.categoria = produto.product_categoria
            novoproduto.descricao = '--'
            novoproduto.valorcompra = produto.valorcompra
            novoproduto.valorvenda = produto.valorvenda
            novoproduto.opcoes = optionarray
            novoproduto.id = produto.product_key

            check = ipcRenderer.sendSync('db_addproduto', novoproduto)
        } else {
            // updata actual product
            optiontochange = producttoedit.opcoes.find(obj => {
                return obj.codigo === String(produto.product_codigo)
            })


            if (optiontochange == undefined) {
                var option = new Object()
                option.quantidade = produto.quantidade
                option.opcao = produto.product_opcoes
                option.codigo = produto.product_codigo

                producttoedit.opcoes.push(option)
                check = ipcRenderer.sendSync("db_editproduto", producttoedit)

            } else {
                optiontochange.quantidade = String(parseInt(optiontochange.quantidade) + parseInt(produto.quantidade))
                check = ipcRenderer.sendSync("db_editproduto", producttoedit)
            }

        }



    });

    if (allproductexists == "") {
        close_popupconfirmavenda()
        swal("Concluído!", "Os produtos retornaram ao estoque", {
            icon: "success",
        });
    } else {
        close_popupconfirmavenda()
        textalert = "Os produtos: (" + allproductexists + ") Não foram encontrados no banco de dados e tiveram quer ser criados! \n" +
            "--- Isso costuma acontecer caso um produto seja deletado do estoque e depois uma venda com ele seja devolvida.\n" +
            "--- Estes foram adicionados ao Estoque com um '000' nos nomes, Edite-os assim que possível!"
        swal("Atenção!", textalert, {
            icon: "success",
        });
    }

    // save with status devolvida
    obj_venda.status = 'devolvida'
    check = ipcRenderer.sendSync("db_editvenda", obj_venda)

}



//=====================================  ESTOQUE   =====================================================
function update_estoquepage() {
    console_log('updateestoquepage')

    // clear estoque table
    var table = document.getElementById("table-estoque");
    while (table.rows.length > 1) {
        table.deleteRow(1)
    }

    allproducts = ipcRenderer.sendSync('db_getallproducts', 'vazio')
    allproducts.sort((a, b) => (a.nome > b.nome) ? 1 : -1)

    counter = 0
    allproducts.forEach(produto => {
        counter += 1
        lastrow = table.length
        var row = table.insertRow(lastrow);
        row.className = 'active'
        row.style.animation = 'insertrowanimation .3s ease'
        var cell_counter = row.insertCell(0);
        var cell_codigo = row.insertCell(1);
        var cell_produto = row.insertCell(2);
        var cell_descricao = row.insertCell(3);
        var cell_qtdade = row.insertCell(4);
        var cell_compra = row.insertCell(5);
        var cell_venda = row.insertCell(6);
        var cell_lucro = row.insertCell(7);
        var cell_opcoes = row.insertCell(8);


        //get quantidade and códigos
        var codigo_todas = ""
        var quantidade_todas = 0
        produto.opcoes.forEach(opcao => {
            if (opcao.quantidade > 0) {
                quantidade_todas += parseInt(opcao.quantidade)
            }
            codigo_todas += "," + opcao.codigo
        });


        cell_counter.innerHTML = counter
        cell_codigo.innerHTML = codigo_todas
        cell_codigo.style.display = 'none'
        cell_produto.innerHTML = produto.nome
        cell_descricao.innerHTML = produto.descricao
        cell_qtdade.innerHTML = quantidade_todas
        cell_compra.innerHTML = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.valorcompra);
        cell_venda.innerHTML = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.valorvenda);
        cell_lucro.innerHTML = String(Math.round(((produto.valorvenda - produto.valorcompra) / produto.valorcompra) * 100)) + '%'

        var buttonedit = document.createElement('img');
        buttonedit.setAttribute("src", "./img/editpencil.png");
        buttonedit.className = 'bouncingbuttonicon'
        buttonedit.onclick = function () {
            edit_produto(produto.id)
            return false;
        };
        cell_opcoes.appendChild(buttonedit)

        var buttondelete = document.createElement('img');
        buttondelete.setAttribute("src", "./img/trash-can.png");
        buttondelete.className = 'bouncingbuttonicon'
        buttondelete.onclick = function () {
            delete_produto(produto.id)
            return false;
        };
        cell_opcoes.appendChild(buttondelete)
    });
}

function estoquepagesearch() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("estoquepagesearch");
    filter = input.value.toUpperCase();
    table = document.getElementById("table-estoque");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[window.metodopesquisaestoquecell];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                //tr[i].style.display = "";
                tr[i].className = 'activerow'
            } else {
                //tr[i].style.display = "none";
                tr[i].className = 'inactiverow'
            }
        }
    }
}

function metodopesquisaestoque(metodo) {
    document.getElementsByClassName('estoquebuttonpesquisaactive')[0].className = ""
    document.getElementById(metodo).className = 'estoquebuttonpesquisaactive'

    if (metodo == 'estoquepesquisa_produto') {
        document.getElementById('estoquepagesearch').placeholder = "Pesquisar por Produto"
        window.metodopesquisaestoquecell = 2
    }
    if (metodo == 'estoquepesquisa_descricao') {
        document.getElementById('estoquepagesearch').placeholder = "Pesquisar por Descrição"
        window.metodopesquisaestoquecell = 3
    }
    if (metodo == 'estoquepesquisa_codigo') {
        document.getElementById('estoquepagesearch').placeholder = "Pesquisar por Código"
        window.metodopesquisaestoquecell = 1
    }
}

function clickcategoriabutton() {
    var isactivec = document.getElementsByClassName('estoque_showhidecategoria_show')[0]
    if (isactivec == undefined) {
        document.getElementById('estoque_showhidecategoria').className = 'estoque_showhidecategoria_show'

        table = document.getElementById('table_estoque_categorias')

        // clear table
        while (table.rows.length > 0) {
            table.deleteRow(0)
        }

        // add option to add category
        if (true) {
            var row = table.insertRow(0)
            var cell_name = row.insertCell(0)
            var cell_addbutton = row.insertCell(1)

            cell_name.innerText = "Adicionar Nova Categoria"
            var button_addcategoria = document.createElement('img')
            button_addcategoria.setAttribute("src", "./img/icon-addcategory2.png");
            button_addcategoria.className = 'bouncingbuttonicon'
            button_addcategoria.onclick = function () {
                open_popupcategoria()
                return false;
            };
            cell_addbutton.appendChild(button_addcategoria)
        }

        // get categorias from database
        if (true) {
            var allcategorias = ipcRenderer.sendSync('db_getallcategorias', 'vazio')
            allcategorias.forEach(categoria => {
                var row = table.insertRow(table.rows.length)

                var cell_name = row.insertCell(0)
                var cell_button = row.insertCell(1)

                cell_name.innerText = categoria.nome

                var button_editcategoria = document.createElement('img')
                button_editcategoria.setAttribute("src", "./img/editpencil.png");
                button_editcategoria.className = 'bouncingbuttonicon'
                button_editcategoria.onclick = function () {
                    edit_categoria(categoria.id)
                    return false;
                };
                cell_button.appendChild(button_editcategoria)
            });

        }

    } else {
        document.getElementById('estoque_showhidecategoria').className = 'estoque_showhidecategoria_hidden'
    }

}

function clickvendedorbutton() {
    var isactivev = document.getElementsByClassName('estoque_showhidevendedor_show')[0]
    if (isactivev == undefined) {
        document.getElementById('estoque_showhidevendedor').className = 'estoque_showhidevendedor_show'

        table = document.getElementById('table_estoque_vendedor')

        // clear table
        while (table.rows.length > 0) {
            table.deleteRow(0)
        }

        // add option to add vendedor
        if (true) {
            var row = table.insertRow(0)
            var cell_name = row.insertCell(0)
            var cell_history = row.insertCell(1)
            var cell_addbutton = row.insertCell(2)

            cell_name.innerText = "Adicionar Novo Vendedor"
            cell_history.innerText = ""
            var button_addvendedor = document.createElement('img')
            button_addvendedor.setAttribute("src", "./img/icon-addseller2.png");
            button_addvendedor.className = 'bouncingbuttonicon'
            button_addvendedor.onclick = function () {
                open_popupvendedor()
                return false;
            };
            cell_addbutton.appendChild(button_addvendedor)
        }

        // get vendedores from database
        if (true) {
            var allvendedores = ipcRenderer.sendSync('db_getallvendedores', 'vazio')
            allvendedores.forEach(vendedor => {
                var row = table.insertRow(table.rows.length)

                var cell_name = row.insertCell(0)
                var cell_history = row.insertCell(1)
                var cell_button = row.insertCell(2)

                cell_name.innerText = vendedor.nome

                var button_history = document.createElement('img')
                button_history.setAttribute("src", "./img/icon-history.png");
                button_history.className = 'bouncingbuttonicon'
                button_history.onclick = function () {
                    historicovendedor(vendedor.id, vendedor.nome)
                    return false;
                };
                cell_history.appendChild(button_history)


                var button_editvendedor = document.createElement('img')
                button_editvendedor.setAttribute("src", "./img/editpencil.png");
                button_editvendedor.className = 'bouncingbuttonicon'
                button_editvendedor.onclick = function () {
                    edit_vendedor(vendedor.id)
                    return false;
                };
                cell_button.appendChild(button_editvendedor)
            });

        }

    } else {
        document.getElementById('estoque_showhidevendedor').className = 'estoque_showhidevendedor_hidden'
    }

}


// ************** POPUP PRODUTO **********************
function open_popupproduto() {
    document.getElementById('form_produto').reset();
    document.getElementById('id_produto').textContent = "";
    document.getElementById('screen_produto').style.display = "block";
    document.getElementById('btn_excluirproduto').style.display = "none";
    document.getElementById('btn_devolucao').style.display = "none";
    document.getElementById('submit_produto').textContent = "Adicionar"
    document.getElementById('header_produto').textContent = "Adicionar Produto";

    // clear table options
    var tableoptions = document.getElementById('table_opcoes')
    while (tableoptions.rows.length > 0) {
        tableoptions.deleteRow(0)
    }

    // ADD CATEGORIAS FROM DATABASE
    var categoriaselector = document.getElementById('selector_categoriaproduto')
    while (categoriaselector.options.length > 1) {
        categoriaselector.remove(1)
    }
    var allcategorias = ipcRenderer.sendSync('db_getallcategorias', 'vazio')
    allcategorias.forEach(categoria => {
        var opt = document.createElement('option');
        opt.value = categoria.id;
        opt.innerText = categoria.nome;
        categoriaselector.appendChild(opt);
    });

    add_option_produto()
}

function close_popupproduto() {
    document.getElementById('form_produto').reset();
    document.getElementById('screen_produto').style.display = "none";
}

function submit_produto() {
    textnome = document.getElementById('produto_nome').value;
    textcategoria = document.getElementById('selector_categoriaproduto').value;
    textdescricao = document.getElementById('produto_descricao').value;
    textvalorcompra = document.getElementById('produto_valorcompra').value;
    textvalorvenda = document.getElementById('produto_valorvenda').value;

    var options = []
    var optionsok = true
    var codigosok = true
    var numberoptions = 0

    //get if the options are all filled
    if (true) {
        var tableopcoes = document.getElementById('table_opcoes')
        var rowLength = tableopcoes.rows.length;
        var allcodigos = []
        for (i = 0; i < rowLength; i++) {
            numberoptions += 1
            //gets cells of current row  
            var oCells = tableopcoes.rows.item(i).cells;

            thisoption = new Object()
            thisoption.opcao = oCells[0].childNodes[0].value
            thisoption.quantidade = oCells[1].childNodes[0].value
            thisoption.codigo = oCells[2].childNodes[0].value
            if (thisoption.codigo == "" || thisoption.opcao == "" || thisoption.quantidade == "") {
                optionsok = false
            }
            options.push(thisoption)

            // check if the code exists on array
            if (allcodigos.indexOf(thisoption.codigo) > -1) {
                codigosok = false
            }
            allcodigos.push(thisoption.codigo)
        }
    }

    if (!optionsok || !codigosok || numberoptions == 0 || textnome == "" || textcategoria == "" || textdescricao == "" || textvalorcompra == "" || textvalorvenda == "") {

        if (optionsok && codigosok && numberoptions > 0) {
            alertbox("Preencha o Campos Principais!")
        } else if (!codigosok) {
            alertbox("Duas variações não podem ter o mesmo código!")
        } else if (!optionsok) {
            alertbox("Preencha todos os Campos das Opções!")
        } else {
            alertbox("Adicione pelo menos uma variação do produto!")
        }
    } else {
        // check if we are creating or editing
        id_produto = document.getElementById('id_produto').textContent
        if (id_produto == "") {
            // check if some product exists with one of this codes
            var produto_to_return = undefined
            var opcao_to_return = undefined

            var allproducts = ipcRenderer.sendSync('db_getallproducts', 'vazio')
            allproducts.forEach(produto => {
                allcodigos.forEach(codigo => {
                    var opcao = produto.opcoes.find(opcao => {
                        if (parseInt(opcao.codigo) == parseInt(codigo)) {
                            produto_to_return = produto
                            opcao_to_return = opcao
                            return true
                        }
                    })
                });
            });


            if (produto_to_return == undefined && opcao_to_return == undefined) {
                novoproduto = new Object();
                novoproduto.nome = textnome
                novoproduto.categoria = textcategoria
                novoproduto.descricao = textdescricao
                novoproduto.valorcompra = textvalorcompra
                novoproduto.valorvenda = textvalorvenda
                novoproduto.opcoes = options

                check = ipcRenderer.sendSync('db_addproduto', novoproduto)

                swal("Produto Adicionado!", "Agora você pode vendê-lo ou editá-lo...", "success");

                close_popupproduto()
                update_estoquepage()
            } else {
                swal({
                    title: "O código: " + opcao_to_return.codigo + " já existe",
                    text: "Produto: '" + produto_to_return.nome + "' Variação: '" + opcao_to_return.opcao + "'",
                    icon: "warning",
                })
            }

        } else {
            // check if some product exists with one of this codes
            var produto_to_return = undefined
            var opcao_to_return = undefined

            var allproducts = ipcRenderer.sendSync('db_getallproducts', 'vazio')
            allproducts.forEach(produto => {
                if (parseInt(id_produto) != parseInt(produto.id)) {
                    allcodigos.forEach(codigo => {
                        var opcao = produto.opcoes.find(opcao => {
                            if (parseInt(opcao.codigo) == parseInt(codigo)) {
                                produto_to_return = produto
                                opcao_to_return = opcao
                                return true
                            }
                        })
                    });
                }
            });


            if (produto_to_return == undefined && opcao_to_return == undefined) {
                editproduto = new Object();
                editproduto.nome = textnome
                editproduto.categoria = textcategoria
                editproduto.descricao = textdescricao
                editproduto.valorcompra = textvalorcompra
                editproduto.valorvenda = textvalorvenda
                editproduto.opcoes = options
                editproduto.id = id_produto

                check = ipcRenderer.sendSync('db_editproduto', editproduto)

                swal("Produto Editado!", "As alterações estão em efeito na página do vendedor...", "success");

                close_popupproduto()
                update_estoquepage()
            } else {
                swal({
                    title: "O código: " + opcao_to_return.codigo + " já existe!",
                    text: "Produto: '" + produto_to_return.nome + "' \nVariação: '" + opcao_to_return.opcao + "'",
                    icon: "warning",
                })
            }



        }

    }
}

function edit_produto(id) {
    open_popupproduto()
    document.getElementById('table_opcoes').deleteRow(0)
    document.getElementById('submit_produto').textContent = "Salvar Edições";
    document.getElementById('header_produto').textContent = "Editar Produto";
    document.getElementById('btn_excluirproduto').style.display = "block";

    var produto_details = ipcRenderer.sendSync('db_gettoeditproduto', id)

    document.getElementById('produto_nome').value = produto_details.nome
    document.getElementById('selector_categoriaproduto').value = produto_details.categoria
    document.getElementById('produto_descricao').value = produto_details.descricao
    document.getElementById('produto_valorcompra').value = produto_details.valorcompra
    document.getElementById('produto_valorvenda').value = produto_details.valorvenda
    document.getElementById('id_produto').textContent = produto_details.id

    document.getElementById('btn_excluirproduto').onclick = function () {
        delete_produto(produto_details.id)
    }

    var table = document.getElementById('table_opcoes')

    var arrayoptions = produto_details.opcoes
    arrayoptions.forEach(opcao => {
        var lastrow = table.rows.length
        var row = table.insertRow(lastrow);
        row.style.animation = 'insertrowanimation .3s ease'

        var cell_opcao = row.insertCell(0);
        var cell_qtdade = row.insertCell(1);
        var cell_codigo = row.insertCell(2);
        var cell_delete = row.insertCell(3);

        var inputopcao = document.createElement('input')
        inputopcao.type = 'text'
        inputopcao.placeholder = 'Opção ' + String(lastrow + 1)
        inputopcao.value = opcao.opcao
        cell_opcao.appendChild(inputopcao)

        var inputqtdade = document.createElement('input')
        inputqtdade.type = 'number'
        inputqtdade.placeholder = 'Qtdade'
        inputqtdade.value = opcao.quantidade
        cell_qtdade.appendChild(inputqtdade)

        var inputcodigo = document.createElement('input')
        inputcodigo.type = 'text'
        inputcodigo.placeholder = 'Código'
        inputcodigo.value = opcao.codigo
        cell_codigo.appendChild(inputcodigo)

        button_delete = document.createElement('img')
        button_delete.src = "./img/trash-can.png"
        button_delete.onclick = function () {
            index = this.closest('tr').rowIndex
            table = document.getElementById('table_opcoes')
            table.deleteRow(index)

        }
        cell_delete.appendChild(button_delete)
    });
}

function delete_produto(id) {
    swal({
        title: "Tem Certeza?",
        text: "Uma vez deletado o produto e suas opções deixarão de existir no banco de dados!",
        icon: "warning",
        buttons: ["Cancelar", "Deletar Mesmo Assim"],
    })
        .then((resultado) => {
            if (resultado) {
                check = ipcRenderer.sendSync('db_deleteproduto', id);
                update_estoquepage()
                swal("Feito! O produto foi deletado", {
                    icon: "success",
                });
            } else {
                swal("Produto não foi deletado", { icon: "error" })
            }
        });

}

function add_option_produto() {
    table = document.getElementById('table_opcoes')

    var lastrow = table.rows.length
    var row = table.insertRow(lastrow);
    row.style.animation = 'insertrowanimation .3s ease'

    var cell_opcao = row.insertCell(0);
    var cell_qtdade = row.insertCell(1);
    var cell_codigo = row.insertCell(2);
    var cell_delete = row.insertCell(3);

    var inputopcao = document.createElement('input')
    inputopcao.type = 'text'
    inputopcao.placeholder = 'Opção ' + String(lastrow + 1)
    cell_opcao.appendChild(inputopcao)

    var inputqtdade = document.createElement('input')
    inputqtdade.type = 'number'
    inputqtdade.placeholder = 'Qtdade'
    cell_qtdade.appendChild(inputqtdade)
    cell_qtdade.style = "width: 20px;"

    var inputcodigo = document.createElement('input')
    inputcodigo.type = 'text'
    inputcodigo.placeholder = 'Código'
    cell_codigo.appendChild(inputcodigo)

    button_delete = document.createElement('img')
    button_delete.src = "./img/trash-can.png"
    button_delete.onclick = function () {
        index = this.closest('tr').rowIndex
        table = document.getElementById('table_opcoes')
        table.deleteRow(index)

    }
    cell_delete.appendChild(button_delete)
}



//*************** POPUP CATEGORIA ***************
function close_categoria() {
    document.getElementById('form_categoria').reset();
    document.getElementById("screen_categoria").style.display = 'none'
}

function open_popupcategoria() {
    document.getElementById('form_categoria').reset();
    document.getElementById("screen_categoria").style.display = 'block'
    document.getElementById('btnexcluircategoria').style.display = "none";
    document.getElementById('categoriaid').textContent = "";
    document.getElementById('headercategoria').textContent = "Adicionar Categoria"
    document.getElementById('submit_categoria').textContent = 'Salvar Categoria'
}

function submit_categoria() {
    nomecategoria = document.getElementById('text_categoria').value
    id = document.getElementById('categoriaid').textContent
    if (nomecategoria == "") {
        alertbox("Preencha o nome da categoria!")
    }
    else {
        if (id == "") {
            obj_categoria = new Object()
            obj_categoria.nome = nomecategoria
            check = ipcRenderer.sendSync('db_addcategoria', obj_categoria)
            close_categoria()
        } else {
            obj_categoriaedit = new Object()
            obj_categoriaedit.nome = nomecategoria
            obj_categoriaedit.id = id
            check = ipcRenderer.sendSync('db_editcategoria', obj_categoriaedit)
            close_categoria()
        }

    }
}

function excluircategoria(idcategoria) {

    swal({
        title: "Tem Certeza?",
        text: "A categoria deixará de existir no banco de dados e os produtos associados à ela deverão ser alocados à outra",
        icon: "warning",
        buttons: ["Cancelar", "Deletar Mesmo Assim"],
    })
        .then((resultado) => {
            if (resultado) {
                check = ipcRenderer.sendSync('db_deletecategoria', idcategoria)
                close_categoria()
                swal("Feito! A categoria foi deletada!", {
                    icon: "success",
                });
            } else {
                swal("Categoria não foi deletada", { icon: "error" })
            }
        });
}

function edit_categoria(id) {
    document.getElementById('form_categoria').reset();
    document.getElementById('headercategoria').textContent = "Editar Categoria"
    document.getElementById('screen_categoria').style.display = 'block'
    document.getElementById('btnexcluircategoria').style.display = "block";
    document.getElementById('submit_categoria').textContent = 'Salvar Edições'

    categoriadetails = ipcRenderer.sendSync('db_getcategoriabykey', id)

    document.getElementById('btnexcluircategoria').onclick = function () {
        excluircategoria(id)
    }

    document.getElementById('categoriaid').textContent = id
    document.getElementById('text_categoria').value = categoriadetails.nome
}



// ************** POPUP VENDEDOR **********************
function open_popupvendedor() {
    document.getElementById('form_vendedor').reset();
    document.getElementById('id_vendedor').textContent = "";
    document.getElementById('screen_vendedor').style.display = "block";
    document.getElementById('btn_excluirvendedor').style.display = "none";
    document.getElementById('submit_vendedor').textContent = "Adicionar"
    document.getElementById('header_vendedor').textContent = "Adicionar Vendedor";
}

function close_popupvendedor() {
    document.getElementById('form_vendedor').reset();
    document.getElementById('screen_vendedor').style.display = "none";
}

function submit_vendedor() {
    textname = document.getElementById('name_vendedor').value;
    textphone = document.getElementById('tel_vendedor').value;

    if (textname == "" || textphone == "") {
        alertbox("Preencha o Nome e o Telefone do Vendedor!")
    } else {
        // check if we are creating or editing
        id_vendedor = document.getElementById('id_vendedor').textContent
        if (id_vendedor == "") {
            novovendedor = new Object();
            novovendedor.nome = textname
            novovendedor.telefone = textphone

            check = ipcRenderer.sendSync('db_savenewvendedor', novovendedor)
        } else {
            editvendedor = new Object();
            editvendedor.nome = textname
            editvendedor.telefone = textphone
            editvendedor.id = id_vendedor

            check = ipcRenderer.sendSync('db_editvendedor', editvendedor)
        }
        close_popupvendedor()
    }


}

function edit_vendedor(id) {
    open_popupvendedor()
    document.getElementById('btn_excluirvendedor').style.display = "block";
    document.getElementById('submit_vendedor').textContent = "Salvar Edições";
    document.getElementById('header_vendedor').textContent = "Editar Vendedor";

    vendedor_details = ipcRenderer.sendSync('db_gettoeditvendedor', id)

    document.getElementById('name_vendedor').value = vendedor_details.nome
    document.getElementById('tel_vendedor').value = vendedor_details.telefone
    document.getElementById('id_vendedor').textContent = vendedor_details.id

    document.getElementById('btn_excluirvendedor').onclick = function () {
        excluirvendedor(vendedor_details.id)
    }
}

function excluirvendedor(vendedorid) {
    swal({
        title: "Tem Certeza?",
        text: "Uma vez deletado, o vendedor deixará de existir no banco de dados e as compras associadas à este ficarão associadas à ninguém!",
        icon: "warning",
        buttons: ["Cancelar", "Deletar Mesmo Assim"],
    })
        .then((resultado) => {
            if (resultado) {
                check = ipcRenderer.sendSync('db_deletevendedor', vendedorid);
                close_popupvendedor()
                swal("Feito! O Vendedor foi deletado", {
                    icon: "success",
                });
            } else {
                swal("Vendedor não foi deletado", { icon: "error" })
            }
        });

}

function historicovendedor(vendedorid, vendedorname) {
    // clear historico table
    var table = document.getElementById("table-historico");
    while (table.rows.length > 1) {
        table.deleteRow(1)
    }

    // open popup
    document.getElementById('screen_historico').style.display = 'block'
    document.getElementById('vendedorhistorico').textContent = vendedorname
    document.getElementById('idhistorico').textContent = vendedorid

    // get historic
    historic = ipcRenderer.sendSync('db_gethistoricovendedor', vendedorid)

    // sort historic by date and timestart
    historic.sort((a, b) => (a.datetime > b.datetime) ? 1 : -1)

    // update table
    historic.forEach(venda => {
        // OBJECT VENDA: key_vendedor, key_product, datetime, valor, formapag, obs, id
        var justdate = venda.datetime.split("T")[0]
        var arraydata = justdate.split("-")
        var data = arraydata[2] + "/" + arraydata[1] + "/" + arraydata[0]
        var justhora = venda.datetime.split("T")[1]
        var arrayhora = justhora.split(":")
        var hora = arrayhora[0] + ":" + arrayhora[1]
        var valor = venda.valortotal
        var formapag = venda.formapag
        var obs = venda.obs
        var id_venda = venda.id
        var produtos = ""

        venda.cart.forEach(produto => {
            produtos += produto.product_name + " " + produto.product_opcoes + ", "
        });

        var table = document.getElementById("table-historico");
        var lastrow = table.rows.length

        var row = table.insertRow(lastrow);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);

        cell1.innerHTML = data;
        cell2.innerHTML = hora;
        cell3.innerHTML = produtos;
        cell4.innerHTML = valor;

        var buttonedit = document.createElement('img');
        buttonedit.setAttribute("src", "./img/editpencil.png");
        buttonedit.className = 'bouncingbuttonicon'
        buttonedit.onclick = function () {
            edit_venda(id_venda);
            return false;
        };
        cell5.appendChild(buttonedit)
    });

    if (historic.length == 0) {
        var table = document.getElementById("table-historico");
        var lastrow = table.length

        var row = table.insertRow(lastrow);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);

        cell1.innerHTML = 'Nenhuma';
        cell2.innerHTML = '-';
        cell3.innerHTML = 'Venda Encontrada';
        cell4.innerHTML = '=(';
        cell5.innerHTML = '';
    }

}

function close_historico() {
    document.getElementById('screen_historico').style.display = 'none'
}




//=====================================  ADMIN   =====================================================
function update_adminpage() {
    // clear tables
    if (true) {
        var table = document.getElementById("table-gasto");
        while (table.rows.length > 1) {
            table.deleteRow(1)
        }
        var table = document.getElementById("table-lucro");
        while (table.rows.length > 1) {
            table.deleteRow(1)
        }
    }

    // check range of dates
    if (true) {
        datestart = window.today
        datefinish = window.today
        if (window.filterbydate) {
            datestart = document.getElementById("datestart").value
            datefinish = document.getElementById("datefinal").value
        } else {
            document.getElementById("datestart").value = window.today
            document.getElementById("datefinal").value = window.today
        }
    }

    //get lucros and gastos on range of dates
    if (true) {
        daterangestart = new Date(datestart + "T11:00:00")
        daterangefinish = new Date(datefinish + "T11:00:00")

        lucrosextraonrangeofdays = []
        lucrosvendasonrangeofdays = []
        gastosonrangeofdays = []
        while (daterangestart.getTime() <= daterangefinish.getTime()) {
            datetogetdata = String(daterangestart.toISOString().split("T")[0])

            lucroextrathisday = ipcRenderer.sendSync('db_getdaylucros', datetogetdata)
            lucrosextraonrangeofdays = lucrosextraonrangeofdays.concat(lucroextrathisday)

            lucrovendathisday = ipcRenderer.sendSync('db_getdayvendas', datetogetdata)
            lucrosvendasonrangeofdays = lucrosvendasonrangeofdays.concat(lucrovendathisday)

            gastothisday = ipcRenderer.sendSync('db_getdaygastos', datetogetdata)
            gastosonrangeofdays = gastosonrangeofdays.concat(gastothisday)

            daterangestart.setDate(daterangestart.getDate() + 1)
        }
        alllucros_extras = lucrosextraonrangeofdays
        alllucros_vendas = lucrosvendasonrangeofdays
        allgastos = gastosonrangeofdays
    }

    // filter by vendedor and controledecaixa
    if (true) {
        // filter by vendedor
        vendedorselected = document.getElementById('selectorhead').value
        if (vendedorselected != 'Todos') {
            vendedorkey = String(ipcRenderer.sendSync('db_getkeybynamevendedor', vendedorselected))
            alllucros_vendas = alllucros_vendas.filter(venda => venda.key_vendedor === vendedorkey);
            alllucros_extras = alllucros_extras.filter(lucro => lucro.responsavel === vendedorselected);
            allgastos = allgastos.filter(gasto => gasto.responsavel === vendedorselected);
        }

        // filter by controledecaixa
        checkedcontroledecaixa = document.getElementById('controledecaixa').checked
        if (checkedcontroledecaixa) {
            alllucros_extras = alllucros_extras.filter(lucro => lucro.movimentacao === 'Dinheiro');
            allgastos = allgastos.filter(gasto => gasto.showcontrole === 'show');
        }
    }

    rentabilidade = 0
    // update lucros
    if (true) {
        // update graphs
        if (true) {
            lucrovendagraphlabel = alllucros_vendas.map(item => item.formapag).filter((value, index, self) => self.indexOf(value) === index)
            lucrographlabel = lucrovendagraphlabel.concat(alllucros_extras.map(item => item.movimentacao).filter((value, index, self) => self.indexOf(value) === index))
            lucrographlabel = lucrographlabel.map(item => item).filter((value, index, self) => self.indexOf(value) === index)
            lucrographdata = []
            lucrographlabel.forEach(movimentacao => {
                sumforthismov = 0
                lucrosextraforthismov = alllucros_extras.filter(lucro => lucro.movimentacao === movimentacao);
                lucrosextraforthismov.forEach(lucro => {
                    sumforthismov += parseFloat(lucro.valor)
                });

                lucrosvendaforthismov = alllucros_vendas.filter(venda => venda.formapag === movimentacao);
                lucrosvendaforthismov.forEach(venda => {
                    sumforthismov += parseFloat(venda.valor)
                });
                lucrographdata.push(sumforthismov)
            });

            creategraphlucro(lucrographlabel, lucrographdata)
        }

        // update tables
        lucrototal = 0
        alllucros_extras.forEach(lucro => {
            lucrototal += parseFloat(lucro.valor)
            var table = document.getElementById("table-lucro");
            lastrow = table.length
            var row = table.insertRow(lastrow);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);
            row.style.backgroundColor = 'rgba(113, 244, 239, 0.05)'

            // OBJECT LUCRO: data, valor, movimentacao, responsavel, descricao,showcontrole, id
            arraydata = lucro.data.split("-")
            cell1.innerHTML = arraydata[2] + "/" + arraydata[1] + "/" + arraydata[0]
            cell2.innerHTML = lucro.responsavel.split(" ")[0];
            cell3.innerHTML = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucro.valor);
            cell4.innerHTML = lucro.movimentacao;
            cell5.innerHTML = lucro.descricao;


            var buttonedit = document.createElement('img');
            buttonedit.setAttribute("src", "./img/editpencil.png");
            buttonedit.className = 'bouncingbuttonicon'
            buttonedit.onclick = function () {
                clicklucrotable(lucro.id);
                return false;
            };
            cell6.appendChild(buttonedit)

        });

        alllucros_vendas.forEach(venda => {
            lucrototal += parseFloat(venda.valor)
            var table = document.getElementById("table-lucro");
            lastrow = table.length
            var row = table.insertRow(lastrow);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);

            vendedor_details = ipcRenderer.sendSync('db_getvendedorbykey', parseInt(venda.key_vendedor))

            datavenda = venda.datetime.split("T")[0]
            arraydata = datavenda.split("-")
            cell1.innerHTML = arraydata[2] + "/" + arraydata[1] + "/" + arraydata[0]
            cell2.innerHTML = vendedor_details.nome.split(" ")[0];
            cell3.innerHTML = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(venda.valor);
            cell4.innerHTML = venda.formapag;
            cell5.innerHTML = venda.obs;


            var buttonedit = document.createElement('img');
            buttonedit.setAttribute("src", "./img/editpencil.png");
            buttonedit.className = 'bouncingbuttonicon'
            buttonedit.onclick = function () {
                edit_venda(venda.id);
                return false;
            };
            cell6.appendChild(buttonedit)
        });

        rentabilidade += lucrototal
        value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucrototal);
        document.getElementById("valor-total-lucro").textContent = value;

    }

    // update gastos
    if (true) {
        // update graphs
        if (true) {
            gastographlabel = allgastos.map(item => item.movimentacao).filter((value, index, self) => self.indexOf(value) === index)
            gastographdata = []
            gastographlabel.forEach(movimentacao => {
                gastosforthismov = allgastos.filter(gasto => gasto.movimentacao === movimentacao);
                sumforthismov = 0
                gastosforthismov.forEach(gasto => {
                    sumforthismov += parseFloat(gasto.valor)
                });
                gastographdata.push(sumforthismov)
            });

            creategraphgasto(gastographlabel, gastographdata)
        }

        //update table
        gastototal = 0
        allgastos.forEach(gasto => {
            gastototal += parseFloat(gasto.valor)
            var table = document.getElementById("table-gasto");
            lastrow = table.length
            var row = table.insertRow(lastrow);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);


            // OBJECT LUCRO: data, valor, movimentacao, responsavel, descricao,showcontrole, id
            arraydata = gasto.data.split("-")
            cell1.innerHTML = arraydata[2] + "/" + arraydata[1] + "/" + arraydata[0]
            cell2.innerHTML = gasto.responsavel.split(" ")[0];
            cell3.innerHTML = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gasto.valor);
            cell4.innerHTML = gasto.movimentacao;
            cell5.innerHTML = gasto.descricao;


            var buttonedit = document.createElement('img');
            buttonedit.setAttribute("src", "./img/editpencil.png");
            buttonedit.className = 'bouncingbuttonicon'
            buttonedit.onclick = function () {
                clickgastotable(gasto.id);
                return false;
            };
            cell6.appendChild(buttonedit)


            row.ondblclick = function () {
                return function () {
                    clickgastotable(gasto.id)
                };
            }(row);
        });
        value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gastototal);
        rentabilidade -= gastototal
        document.getElementById("valor-total-gasto").textContent = value;
    }

    //set rentabilidade
    document.getElementById('rentabilidade').textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rentabilidade);

}

function creategraphlucro(labels, data) {
    try {
        window.mygraphlucro.destroy()
    }
    catch (err) {
        a = 'ERROR'
    }
    var ctxprofit = document.getElementById("graphlucro").getContext('2d');
    var configprofit = {
        responsive: true,
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: "Lucro",
                borderColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderWidth: 1,
                backgroundColor: [
                    'rgba(74, 255, 61, 0.15)',

                    'rgba(54, 162, 235, 0.15)',
                    'rgba(255, 206, 86, 0.15)',
                    'rgba(75, 192, 192, 0.15)',
                    'rgba(153, 102, 255, 0.15)',
                    'rgba(255, 159, 64, 0.15)',
                    'rgba(255, 99, 132, 0.15)',
                    'rgba(54, 162, 235, 0.15)',
                    'rgba(255, 206, 86, 0.15)',
                    'rgba(75, 192, 192, 0.15)',
                    'rgba(153, 102, 255, 0.15)',
                    'rgba(255, 159, 64, 0.15)'
                ],
                data: data
            }]
        },
        options: {
            segmentStrokeColor: "rgba(15, 255, 255, 0.4)",
            maintainAspectRatio: false,
            legend: {
                display: true,
                position: "left"
            },
            title: {
                display: true,
                text: 'Receitas'
            },
            tooltips: {
                enabled: true,
                backgroundColor: '#f5f5f5',
                titleFontColor: '#000000',
                bodyFontColor: '#000000',
                titleFontSize: 15,
                titleFontStyle: 'bold',
                bodyFontSize: 13,
                bodyFontStyle: 'bold',
                bodySpacing: 4,
                xPadding: 12,
                yPadding: 6,
                position: "average",
                mode: 'label',
                callbacks: {
                    label: function (tooltipItem, data) {
                        var indice = tooltipItem.index;
                        value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.datasets[0].data[indice]);

                        return data.labels[indice] + ':  ' + value + '';
                    }
                }
            },
        }
    }
    window.mygraphlucro = new Chart(ctxprofit, configprofit);
}

function creategraphgasto(labels, data) {
    try {
        window.mygraphgasto.destroy()
    }
    catch (err) {
        a = 'ERROR'
    }

    var ctxprofit = document.getElementById("graphgasto").getContext('2d');
    var configprofit = {
        responsive: true,
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: "Gasto",
                borderColor: [
                    'rgba(255, 99, 132, 0.15)',
                    'rgba(255, 159, 64, 0.15)',
                    'rgba(153, 102, 255, 0.15)',
                    'rgba(54, 162, 235, 0.15)',
                    'rgba(255, 206, 86, 0.15)',
                    'rgba(75, 192, 192, 0.15)',
                    'rgba(153, 102, 255, 0.15)',
                    'rgba(255, 159, 64, 0.15)',
                    'rgba(255, 99, 132, 0.15)',
                    'rgba(54, 162, 235, 0.15)',
                    'rgba(255, 206, 86, 0.15)',
                    'rgba(75, 192, 192, 0.15)'
                ],
                borderWidth: 1,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.15)',
                    'rgba(255, 159, 64, 0.15)',
                    'rgba(153, 102, 255, 0.15)',
                    'rgba(54, 162, 235, 0.15)',
                    'rgba(255, 206, 86, 0.15)',
                    'rgba(75, 192, 192, 0.15)',
                    'rgba(153, 102, 255, 0.15)',
                    'rgba(255, 159, 64, 0.15)',
                    'rgba(255, 99, 132, 0.15)',
                    'rgba(54, 162, 235, 0.15)',
                    'rgba(255, 206, 86, 0.15)',
                    'rgba(75, 192, 192, 0.15)'
                ],
                data: data
            }]
        },
        options: {
            segmentStrokeColor: "rgba(15, 255, 255, 0.4)",
            maintainAspectRatio: false,
            legend: {
                position: "right",
                display: true
            },
            title: {
                display: true,
                text: 'Despesas'
            },
            tooltips: {
                enabled: true,
                backgroundColor: '#f5f5f5',
                titleFontColor: '#000000',
                bodyFontColor: '#000000',
                titleFontSize: 15,
                titleFontStyle: 'bold',
                bodyFontSize: 13,
                bodyFontStyle: 'bold',
                bodySpacing: 4,
                xPadding: 12,
                yPadding: 6,
                position: "average",
                mode: 'label',
                callbacks: {
                    label: function (tooltipItem, data) {
                        var indice = tooltipItem.index;
                        value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.datasets[0].data[indice]);

                        return data.labels[indice] + ':  ' + value + '';
                    }
                }
            },
        }
    }
    window.mygraphgasto = new Chart(ctxprofit, configprofit);
}

function clickmostrarresultados() {
    datainit = document.getElementById("datestart").value
    datafinish = document.getElementById("datefinal").value
    if (datainit == "" || datafinish == "") {
        alertbox("Preencha as datas corretamente!")
        window.filterbydate = false
    } else {
        if (datafinish < datainit) {
            window.filterbydate = false
            alertbox("A data inicial deve ser menor que a data final!")
        } else {
            window.filterbydate = true
            update_adminpage()
        }
    }
}

function clickcontroledecaixa() {
    update_adminpage()
}




// ********************** POP UP LUCRO E GASTOS *****************************
function open_popuplucro(type) {
    document.getElementById("screen_lucro").style.display = "block"
    document.getElementById("btnexcluirlucro").style.display = "none"
    document.getElementById('addlucroid').textContent = ""

    // clear selector movimentação e responsavel
    var movselector = document.getElementById('movimentacao_lucro');
    while (movselector.options.length > 1) {
        movselector.remove(1)
    }
    var respselector = document.getElementById('responsavel_lucro');
    while (respselector.options.length > 1) {
        respselector.remove(1)
    }

    if (type == 'lucro') {
        window.lucroadd = "lucro";
        document.getElementById('checkaddcontrolecontainer').style.display = 'none'
        document.getElementById("header-add").textContent = "Adicionar Lucro"
        var movsavailable = ["Boleto", "Dinheiro", "Cheque", "Transferência", "Cartão de Crédito", "Cartão de Débito", "Outros"];
    }
    else {
        window.lucroadd = "gasto";
        document.getElementById('checkaddcontrolecontainer').style.display = 'flex'
        document.getElementById("header-add").textContent = "Adicionar Gasto"
        var movsavailable = ["Funcionários", "Dental", "Energia Elétrica", "Contas de Água", "Embalagem", "Mercado", "Outros"];
    }

    for (mov in movsavailable) {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(movsavailable[mov]));
        opt.value = movsavailable[mov];
        movselector.appendChild(opt);
    }

    // SET Responsavel NAMEs
    var opt = document.createElement('option');
    opt.value = '';
    opt.innerText = 'Responsável';
    opt.selected = true
    opt.hidden = true
    opt.disabled = true
    respselector.appendChild(opt);

    // get vendedor names from database
    allvendedores = ipcRenderer.sendSync('db_getallvendedores', 'vazio')

    // set vendedor names 
    allvendedores.forEach(vendedor => {
        var opt = document.createElement('option');
        opt.textContent = vendedor.nome;
        opt.value = vendedor.nome;
        respselector.appendChild(opt);
    });
}

function close_popuplucro() {
    document.getElementById('form_lucro').reset();
    document.getElementById("screen_lucro").style.display = "none"
}

function submit_lucro() {
    textdate = document.getElementById('dateaddlucro').value;
    textvalor = document.getElementById('valoradd').value;
    textmovim = document.getElementById('movimentacao_lucro').value;
    textresponsavel = document.getElementById('responsavel_lucro').value;
    obslucro = document.getElementById('obslucro').value;
    checkboxaddcontrole = document.getElementById('checkaddcontrole')
    // replace obs
    if (obslucro == "") {
        obslucro = " - "
    }

    // check if all entryes are ok
    if (textdate == "" || textvalor == "" || textmovim == "" || textresponsavel == "") {
        alertbox("Complete os Campos Principais!");
    } else {
        // check if its editing or adding
        addlucroid = document.getElementById('addlucroid').textContent;
        if (addlucroid == "") {
            if (window.lucroadd == "lucro") {
                obj_lucro = new Object()
                obj_lucro.data = textdate
                obj_lucro.valor = textvalor
                obj_lucro.movimentacao = textmovim
                obj_lucro.responsavel = textresponsavel
                obj_lucro.descricao = obslucro
                obj_lucro.showcontrole = 'show'
                check = ipcRenderer.sendSync('db_addlucro', obj_lucro)
            } else if (window.lucroadd == "gasto") {
                showcontrole = 'hide'
                if (checkboxaddcontrole.checked) {
                    showcontrole = 'show'
                }
                obj_gasto = new Object()
                obj_gasto.data = textdate
                obj_gasto.valor = textvalor
                obj_gasto.movimentacao = textmovim
                obj_gasto.responsavel = textresponsavel
                obj_gasto.descricao = obslucro
                obj_gasto.showcontrole = showcontrole
                check = ipcRenderer.sendSync('db_addgasto', obj_gasto)
            }
        } else {
            if (window.lucroadd == "lucro") {
                obj_lucroedit = new Object()
                obj_lucroedit.data = textdate
                obj_lucroedit.valor = textvalor
                obj_lucroedit.movimentacao = textmovim
                obj_lucroedit.responsavel = textresponsavel
                obj_lucroedit.descricao = obslucro
                obj_lucroedit.showcontrole = 'show'
                obj_lucroedit.id = addlucroid
                check = ipcRenderer.sendSync('db_editlucro', obj_lucroedit)
                close_popuplucro()
            } else if (window.lucroadd == "gasto") {
                showcontrole = 'hide'
                if (document.getElementById('checkaddcontrole').checked) {
                    showcontrole = 'show'
                }
                obj_gastoedit = new Object()
                obj_gastoedit.data = textdate
                obj_gastoedit.valor = textvalor
                obj_gastoedit.movimentacao = textmovim
                obj_gastoedit.responsavel = textresponsavel
                obj_gastoedit.descricao = obslucro
                obj_gastoedit.showcontrole = showcontrole
                obj_gastoedit.id = addlucroid
                check = ipcRenderer.sendSync('db_editgasto', obj_gastoedit)
                close_popuplucro()
            }
        }

        document.getElementById('form_lucro').reset();

        update_adminpage()

    }
}

function clicklucrotable(id) {
    open_popuplucro('lucro')
    document.getElementById("header-add").textContent = "Editar Lucro"
    document.getElementById("submit_lucro").textContent = "Salvar Edições"

    lucrotoedit = ipcRenderer.sendSync('db_gettoeditlucro', id)

    document.getElementById('addlucroid').textContent = id
    document.getElementById('dateaddlucro').value = lucrotoedit.data;
    document.getElementById('valoradd').value = lucrotoedit.valor;
    document.getElementById('movimentacao_lucro').value = lucrotoedit.movimentacao;
    document.getElementById('responsavel_lucro').value = lucrotoedit.responsavel;
    document.getElementById('obslucro').value = lucrotoedit.descricao;
    if (lucrotoedit.showcontrole == 'show') {
        document.getElementById('checkaddcontrole').checked = true;
    } else {
        document.getElementById('checkaddcontrole').checked = false;
    }
}

function clickgastotable(id) {
    open_popuplucro('gasto')
    document.getElementById("header-add").textContent = "Editar Gasto"
    document.getElementById("submit_lucro").textContent = "Salvar Edições"


    gastotoedit = ipcRenderer.sendSync('db_gettoeditgasto', id)

    document.getElementById('addlucroid').textContent = id
    document.getElementById('dateaddlucro').value = gastotoedit.data;
    document.getElementById('valoradd').value = gastotoedit.valor;
    document.getElementById('movimentacao_lucro').value = gastotoedit.movimentacao;
    document.getElementById('responsavel_lucro').value = gastotoedit.responsavel;
    document.getElementById('obslucro').value = gastotoedit.descricao;
    if (gastotoedit.showcontrole == 'show') {
        document.getElementById('checkaddcontrole').checked = true;
    } else {
        document.getElementById('checkaddcontrole').checked = false;
    }
}

function excluirlucro() {
    id = document.getElementById('addlucroid').textContent
    if (window.lucroadd == 'lucro') {
        check = ipcRenderer.sendSync('db_deletelucro', id)
    } else if (window.lucroadd == 'gasto') {
        check = ipcRenderer.sendSync('db_deletegasto', id)
    }
    close_popuplucro()
    update_profitpage()
}











// ********************** ALERTBOX *****************************
function alertbox(text) {
    swal(text, "...", "warning");
}