// element 
const root = getEL('#root');
let list_item_box;

// database - START
function local_database(props){
    switch(props.type){
        case 'GET':
            return JSON.parse(localStorage.getItem('expenditure')) || []
            break;
        case 'SET':
            localStorage.setItem('expenditure',JSON.stringify(props.data))
            break;
        case 'DEL':
            localStorage.removeItem('expenditure')
            break
    }
}

function order_by(props){
    switch(props.type){
        case 'GET':
            return JSON.parse(localStorage.getItem('sorted')) || 'time'
            break;
        case 'SET':
            localStorage.setItem('sorted', JSON.stringify(props.nama))
            break;
    }
}
// database - END


// data manipulation - START
function sort_data_by(type){
    let data = local_database({type:'GET'});

    if(type.includes('name')){
        data.sort((a, b) => {
            const fa = a.item_name.toLowerCase();
            const fb = b.item_name.toLowerCase();

            if (fa < fb) return -1
            if (fa > fb) return 1

            return 0;
        })
    }else if(type.includes('price')){
        data.sort((a, b) => a.item_price - b.item_price);
    }else{
        data.sort((a, b) => a.create_time - b.create_time);
    }

    return type.includes('Reverse') ? data.reverse() : data
}

function change_data(props){
    let data = local_database({type:'GET'});

    switch(props.type){
        case 'DEL':
            for (let i = 0; i < data.length; i++) {
                if (data[i].id == props.payload.id) {
                    data.splice(i, 1);
                    break
                }
            }
            break;
        case 'ADD':
            data.push({
                item_name: props.payload.item_name,
                item_price: props.payload.item_price,
                id: Date.now(),
                create_time: Date.now(),
                priority: false
            })
            break;
        case 'EDIT':
            for (let i = 0; i < data.length; i++) {
                if (data[i].id == props.payload.id) {
                    data[i] = {
                        item_name: props.payload.item_name,
                        item_price: props.payload.item_price,
                        id: data[i].id,
                        create_time: data[i].create_time,
                        priority: props.payload.priority === undefined ? data[i].priority : props.payload.priority
                    }
                    break
                }
            }
            break;
    }

    local_database({type:'SET',data:data});
}
// data manipulation - END


// return a value - START
function price_all_items(prices){
    return prices.length ? prices.reduce((f,s) => f + s) : 0
}


// utility - START
function price_beauty(price){
    const convert = (+price).toString().split("").reverse();
    const newArr = new Array();

    convert.forEach((x,i) => {
        if (i != 0 && i % 3 === 0) newArr.push('.')
        newArr.push(x)
    })

    return newArr.reverse().join('')
}

function action_confirm() {
    const random = ~~(Math.random() * (99 - 10) + 10)
    const input = window.prompt(`Enter Number ${random}`)

    return input == random ? true : false
}

function element_builder(props){
    const element = document.createElement(props.tag);
    props.parent.appendChild(element);

    if(props.innerText) element.innerText = props.innerText;

    if(props.attributes) Object.entries(props.attributes).forEach(item => item[1] && element.setAttribute(item[0],item[1]));

    return element
}

function handle_change_data(props){
    let data = local_database({type:'GET'});

    switch(props.type){
        case 'DEL':
            const confirmation = confirm('Sure delete item!!!')

            if(confirmation){
                change_data({
                    type: props.type,
                    payload: {
                        id: props.payload.id
                    }
                })
            }
            break;
        case 'EDIT':
            change_data({
                type: props.type,
                payload: {
                    id: props.payload.id,
                    item_name: props.payload.item_name,
                    item_price: props.payload.item_price,
                    priority: props.payload.priority
                }
            })
            break;
    }
    render()
}

function clickEvent(element,func){
    element.addEventListener('click', () => func())
}

function getEL(target){
    return document.querySelector(target);
}

function handle_duplicate_input(props){
    const data = local_database({type:'GET'});

    for(let index = 0; index < data.length; index++){
        if(data[index].item_name.toLowerCase() == props.payload.name.toLowerCase()){
            if(props.action == 'EDIT'){
                if(props.payload.id == data[index].id){
                    return false
                }
            }
            return true
        }
    }

    return false
}
// utility - END


// element - START
function add_brand_el(){
    element_builder({
        tag: 'h2',
        parent: root,
        innerText: 'Shopping List',
        attributes: {
            class: 'brand-header'
        }
    })
}

function add_list_el(){
    const div3 = element_builder({
        tag: 'div',
        parent: list_item_box,
        attributes: {
            class: 'list-items'
        }
    });

    sort_data_by(order_by({type:'GET'})).sort((a,b) => b.priority - a.priority)
    .forEach(item => {

        const li = element_builder({
            tag: 'li',
            parent: div3,
            attributes: {
                class: 'item'
            }
        })

        const div1 = element_builder({
            tag: 'div',
            parent: li,
            attributes: {
                class: 'nameNprice-container'
            }
        })

        element_builder({
            tag: 'span',
            parent: div1,
            innerText: item.item_name
        })

        element_builder({
            tag: 'li',
            parent: div1,
            innerText: price_beauty(item.item_price)
        })

        const div2 = element_builder({
            tag: 'div',
            parent: li,
            attributes: {
                class: 'set-item'
            }
        })

        const i1 = element_builder({
            tag: 'i',
            parent: div2,
            attributes: {
                class: 'bi-prescription2 btn'
            }
        })

        clickEvent(i1,() => {
            handle_change_data({
                type: 'DEL',
                payload: {
                    id: item.id
                }
            })
        })

        const i2 = element_builder({
            tag: 'i',
            parent: div2,
            attributes: {
                class: 'bi-pencil-square btn'
            }
        })

        clickEvent(i2,() => {
            add_input_item_el({
                action: 'EDIT',
                id: item.id
            })
        })

        const i3 = element_builder({
            tag: 'i',
            parent: div2,
            attributes: {
                class: item.priority ? 'bi-file-earmark-minus' : 'bi-file-earmark-plus' + ' btn'
            }
        })

        i3.className.includes('minus') ? li.classList.add('priority') : li.classList.remove('priority')

        clickEvent(i3,() => {
            handle_change_data({
                type: 'EDIT',
                payload: {
                    id: item.id,
                    item_name: item.item_name,
                    item_price: item.item_price,
                    priority: !item.priority
                }
            })
        })
    })
}

function add_total_item_el(){
    const length = local_database({type:'GET'}).length

    element_builder({
        tag: 'span',
        parent: getEL('#container-list-item-up'),
        attributes: {
            class: 'total-items up'
        },
        innerText: length == 0 ? 'No List, Click The + Icon to Add' : `${length} items`
    })
}

function add_add_btn_el(){
    const container = element_builder({
        tag: 'div',
        parent: root,
        attributes: {
            class: "add-item"
        }
    })

    const child = element_builder({
        tag: 'i',
        parent: container,
        attributes: {
            class: 'bi bi-plus-square btn'
        }
    })

    clickEvent(child,() => add_input_item_el({action: "ADD"}))
}

function add_menu_setting_el(){
    const container = element_builder({
        tag: 'div',
        parent: root,
        attributes: {
            class: 'menu-setting'
        }
    })

    const child = element_builder({
        tag: 'i',
        parent: container,
        attributes: {
            class: 'bi bi-gear btn'
        }
    })

    clickEvent(child,add_setting_el)
}

function add_total_price_el(){
    const prices = price_all_items(local_database({type:'GET'}).map(price => +price.item_price));

    element_builder({
        tag: 'p',
        parent: list_item_box,
        attributes: {
            class: 'total-items down'
        },
        innerText: `Total price of all items = ${price_beauty(prices)}`
    })
}

function add_sort_by_el(){
    let sort = order_by({type:'GET'});
    const label = sort.includes('name') ? 'Name' : sort.includes('price') ? 'Price' : 'Time';

    const element = element_builder({
        tag: 'span',
        parent: getEL('#container-list-item-up'),
        attributes: {
            class: 'total-items up sorted-list btn'
        },
        innerText: `Sort By ${label}`
    })

    clickEvent(element,() => {
        const list = add_popup_el([
            {id: 'sortNama', inner: 'Name'},
            {id: 'sortWaktu', inner: 'Time'},
            {id: 'sortHarga', inner: 'Price'}])

        list.forEach(li => {
            clickEvent(li,() => {
                let by = order_by({type:'GET'});
                let temp;

                switch(li.id){
                    case 'sortNama':
                        temp = change('name')
                        break
                    case 'sortHarga':
                        temp = change('price')
                        break
                    default:
                        temp = change('time')
                }

                function change(tag){
                    return by.includes('Reverse') ? tag.replace('Reverse','') : tag + 'Reverse'
                }

                order_by({type:'SET',nama:temp})
                render()
            })
        })
    })
}

function add_header_el(){
    element_builder({
        tag: 'div',
        parent: list_item_box,
        attributes: {
            class: 'container-list-item-up',
            id: 'container-list-item-up'
        }
    })

    add_total_item_el()
    local_database({type: 'GET'}).length && add_sort_by_el()
}

function add_li_container(){
    list_item_box = element_builder({
        tag: 'div',
        parent: root,
        attributes: {
            class: "list-item-box"
        }
    }) 
    add_header_el()
    add_list_el()
}

function add_popup_el(props) {
    const container = element_builder({
        tag: 'div',
        parent: root,
        attributes: {
            class: 'container-select-sorted'
        }
    })

    clickEvent(container,() => {
        container.remove()
        getEL('div.child-container-select-sorted').remove()
    })

    const child = element_builder({
        tag: 'div',
        parent: root,
        attributes: {
            class: 'child-container-select-sorted'
        }
    })

    return props.map(item => {
        return item && element_builder({
            tag: 'li',
            parent: child,
            attributes: {
                id: item.id ? item.id : null,
                class: 'btn'
            },
            innerText: item.inner
        })
    })
}

function add_input_item_el(props) {

    const container = element_builder({
        tag: 'div',
        parent: root,
        attributes: {
            class: 'input-container'
        }
    })

    const box = element_builder({
        tag: 'div',
        parent: container,
        attributes: {
            class: 'input-box'
        }
    })

    const close = element_builder({
        tag: 'i',
        parent: box,
        attributes: {
            class: 'btn-close bi-x-circle btn'
        }
    })
    clickEvent(close,() => container.remove())

    const input_item = element_builder({
        tag: 'input',
        parent: box,
        attributes: {
            class: 'input-item',
            placeholder: 'Item Name'
        }
    })
    input_item.focus()
    input_item.addEventListener('keydown',e => e.key == "Enter" && input_price.focus())

    const input_price = element_builder({
        tag: 'input',
        parent: box,
        attributes: {
            class: 'input-item', 
            placeholder: 'Item Price', 
            type: 'number'
        }
    })
    input_price.addEventListener('keydown',e => {
        e.key == 'Enter' && button.focus()
        if(e.key == "Backspace" && !e.target.value) input_item.focus()
    })

    if(props.action == 'EDIT') {
        const data = local_database({type:'GET'});
        for(x of data){
            if(x.id == props.id){
                input_price.value = x.item_price
                input_item.value = x.item_name
                break
            }
        }
    }

    const button = element_builder({
        tag: 'button',
        parent: box,
        attributes: {
            class: 'btn-add btn'
        },
        innerText: props.action == 'ADD' ? 'add' : 'edit'
    })

    clickEvent(button,() => {
        const priceCond = input_price.value.trim() && +input_price.value >= 0 ? true : false;
        const nameCond = input_item.value.trim() ? true : false;

        function handleSuccess(){

            if(handle_duplicate_input({action: props.action,payload: {name: input_item.value.trim(),id: props.id}})){
                const konfirmasi = confirm('items already exist, sure keep adding?')
                if(!konfirmasi) return
            }
            change_data({
                type: props.action == 'EDIT' ? 'EDIT' : 'ADD',
                payload: {
                    id: props.id,
                    item_name: input_item.value.trim(),
                    item_price: input_price.value.trim()
                }
            })

            render()
        }

        function handleFailed(){
            nameCond ? input_item.classList.remove('invalid') : input_item.classList.add('invalid');
            priceCond ? input_price.classList.remove('invalid') : input_price.classList.add('invalid');
        }

        priceCond && nameCond ? handleSuccess() : handleFailed()
    })
}

function add_setting_el(){
    const data = local_database({type: 'GET'});

    const [del] = add_popup_el([{ inner: 'Delete All Data' }])

    clickEvent(del,() =>{
        if (action_confirm()) {
            local_database({type:'DEL'});
            render()
        }else{
            alert('invalid input')
        }        
    })
}

function render(){
    root.innerHTML = ''

    // header 
    add_brand_el()
    add_add_btn_el()

    // content
    add_li_container()

    // footer
    const length = local_database({type:'GET'}).length
    length && add_total_price_el()
    length && add_menu_setting_el()
}
// element - END


render()