const button = document.querySelector('.contain button')
const navbar = document.querySelector('.navbar')
const search = document.querySelector('.d-flex')
const searchInput = document.querySelector('.form-control')
const show = document.querySelector('#show')
const pagination=document.querySelector('.pagination')
const ChosenList = []
let ListPage=1, ChosenPage=1, SearchPage=1

//網頁第一次開啟時預設All List第一頁
axios.get('https://user-list.alphacamp.io/api/v1/users')
.then(response => {
  const AllData=response.data.results
  showList(1,AllData,"所有名單")
})
.catch(error => console.log(error))

//轉換"所有名單"及"願望清單"，同時轉換對應的內容
navbar.addEventListener('click', function (event) {
    const target=event.target
    const navbarActive = document.querySelector('a.active')
    if(target.classList.contains("nav-link")){
        if(navbarActive){
          navbarActive.classList.remove('active')
        }
        target.classList.add('active')
        //轉換List裡面的內容
        if(target.text==="願望清單"){
            if (ChosenList.length !==0){
                axios.get('https://user-list.alphacamp.io/api/v1/users')
                .then(response => {
                    const AllData=response.data.results
                    const ChosenListData=[]
                    for(let num=0; num<ChosenList.length; num++){
                        ChosenListData.push(AllData[ChosenList[num]-1])
                    }
                    showList(ChosenPage,ChosenListData)
                })
                .catch(error => console.log(error))
            }
            else{
                show.innerHTML="目前沒有任何人在願望清單喔！"
                pagination.innerHTML=`
                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                `
            }          
        }
        else{          
          axios.get('https://user-list.alphacamp.io/api/v1/users')
            .then(response => {
              const AllData=response.data.results
              showList(ListPage,AllData,target.text)    
            })
            .catch(error => console.log(error))
        }
    }
})

//轉換頁數，同時轉換對應的內容
pagination.addEventListener('click', function (event) {
    const target=event.target
    let SearchListData = []
    if(target.classList.contains("page-link")){
        if(document.querySelector('a.active').text==="願望清單"){
        ChosenPage=changePage(ChosenPage,target.text)
        axios.get('https://user-list.alphacamp.io/api/v1/users')
            .then(response => {
            const AllData=response.data.results
            const ChosenListData=[]
            for(let num=0; num<ChosenList.length; num++){
                ChosenListData.push(AllData[ChosenList[num]-1])
            }
            showList(ChosenPage,ChosenListData)
            })
            .catch(error => console.log(error))
            showPage (ChosenPage)
        }else{
        axios.get('https://user-list.alphacamp.io/api/v1/users')
            .then(response => {
            const AllData=response.data.results
            //有搜尋條件
            if(searchInput.value){
                SearchPage=changePage(SearchPage,target.text)
                for (id in AllData){
                if(AllData[id].region.toLowerCase() === searchInput.value.toLowerCase()){
                    SearchListData.push(AllData[id])
                }
                }
                showList(SearchPage,SearchListData,"所有名單")
            }
            //沒有搜尋條件
            else{
                ListPage=changePage(ListPage,target.text)
                showList(ListPage,AllData,"所有名單")
            }          
            })
            .catch(error => console.log(error))
        }
    }
})

//選取人物 & 刪除選取
show.addEventListener('click', function (event) {
    const target=event.target.id.slice(6)
    const targetIndex=ChosenList.indexOf(target)
    const navbarActive = document.querySelector('a.active')
    if(event.target.id.slice(0,6) === "chosen"){
        if (navbarActive.text==="所有名單"){
            const target=event.target.id.slice(6)
            const targetIndex=ChosenList.indexOf(target)
            if (targetIndex===-1){
                ChosenList.push(target)
                alert('選取成功！')
            }
            else{alert('你已經選過這個人了喔！')}
        }else{
            ChosenList.splice(targetIndex,1)
            axios.get('https://user-list.alphacamp.io/api/v1/users')
            .then(response => {
                const AllData=response.data.results
                const ChosenListData=[]
                for(let num=0; num<ChosenList.length; num++){
                  ChosenListData.push(AllData[ChosenList[num]-1])
                }
                showList(ChosenPage,ChosenListData)
            })
            .catch(error => console.log(error))
        }
    }
})

//搜尋名單
search.addEventListener('submit', function onSearchFormSubmitted(event){
    event.preventDefault()
    const keyword = searchInput.value.trim().toLowerCase()
    let SearchListData = []
    if (!keyword.length) {
        return alert('請輸入有效字串！')
    }
    axios.get('https://user-list.alphacamp.io/api/v1/users')
        .then(response => {
            const AllData=response.data.results
            for (id in AllData){
                if(AllData[id].region.toLowerCase() === keyword){
                SearchListData.push(AllData[id])
                }        
            }
            if(SearchListData.length===0){show.innerHTML="<p>沒有你要的搜尋結果喔！請重新設定國家，或是按Cancel返回所有名單</p>"}
            else{
                showList (1,SearchListData,"所有名單")
                showPage(1)
            }      
        })
        .catch(error => console.log(error))
})

//取消搜尋
search.addEventListener('reset', function onSearchFormReseted(event)  {
    axios.get('https://user-list.alphacamp.io/api/v1/users')
        .then(response => {
            const AllData=response.data.results
            showList (1,AllData,"所有名單")
            showPage(1)
        })
        .catch(error => console.log(error))
})

//呈現名單
function showList (page,inputData,title){
    let buttonType
    let perNum=2
    let max=perNum*page
    if(title==="所有名單"){
        buttonType=["success","Add"]
    }else{
        buttonType=["danger","Remove"]
    }
    if(inputData.length<perNum*page){
        max=inputData.length
    }else if(inputData.length<perNum*page-2){
        page=page-1
    }
    show.innerHTML=""
    for (let num=perNum*(page-1) ; num<max ; num++){
        show.innerHTML+=`
            <div class="card" style="width: 18rem;">
            <img src="${inputData[num].avatar}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">${inputData[num].name} ${inputData[num].surname}</h5>
                <p class="card-text">Hi, I am from ${inputData[num].region}. My ID is ${inputData[num].id}.</p>
            </div>
            <div class="card-footer">
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#friend${inputData[num].id}" data-bs-whatever="Guillaume Vincent">More</button>
                <button id="chosen${inputData[num].id}" type="button" class="btn btn-${buttonType[0]}">${buttonType[1]}</button>
            </div>
            </div>  
            <div class="modal fade" id="friend${inputData[num].id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">${inputData[num].name} ${inputData[num].surname}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>email: ${inputData[num].email}</p>
                    <p>gender: ${inputData[num].gender}</p>
                    <p>age: ${inputData[num].age}</p>
                    <p>region: ${inputData[num].region}</p>
                    <p>birthday: ${inputData[num].birthday}</p>
                </div>
                </div>
            </div>
            </div>
    `}
    pagination.innerHTML=`
        <li class="page-item"><a class="page-link" href="#">1</a></li>
        <li class="page-item"><a class="page-link" href="#">2</a></li>
        <li class="page-item"><a class="page-link" href="#">3</a></li>
        <li class="page-item"><a class="page-link" href="#">4</a></li>
        <li class="page-item"><a class="page-link" href="#">5</a></li>
    `
    if(Number(page)!==1){
        pagination.innerHTML=`
        <li class="page-item"><a class="page-link" href="#">Previous</a></li>
        `+pagination.innerHTML
        pagination.children[page].classList.add("active")
    }
    if(Number(page)!==5){
        pagination.innerHTML+=`
        <li class="page-item"><a class="page-link" href="#">Next</a></li>
        `
        if(Number(page)===1){pagination.children[page-1].classList.add("active")}
        else{pagination.children[page].classList.add("active")}
    }
}

//呈現頁數
function showPage (page){
    pagination.innerHTML=`
        <li class="page-item"><a class="page-link" href="#">1</a></li>
        <li class="page-item"><a class="page-link" href="#">2</a></li>
        <li class="page-item"><a class="page-link" href="#">3</a></li>
        <li class="page-item"><a class="page-link" href="#">4</a></li>
        <li class="page-item"><a class="page-link" href="#">5</a></li>
    `
    if(Number(page)!==1){
        pagination.innerHTML=`
        <li class="page-item"><a class="page-link" href="#">Previous</a></li>
        `+pagination.innerHTML
        pagination.children[page].classList.add("active")
    }
    if(Number(page)!==5){
        pagination.innerHTML+=`
        <li class="page-item"><a class="page-link" href="#">Next</a></li>
        `
        if(Number(page)===1){pagination.children[page-1].classList.add("active")}
        else{pagination.children[page].classList.add("active")}
    }
}

//轉換頁數,上一頁,下一頁
function changePage(page,target){
    if (target==="Previous"){
        //點擊上一頁
        page=Number(page)-1
    }else if(target==="Next"){
        //點擊下一頁
        page=Number(page)+1
    }else{
        //點擊頁數時
        page=target
    }
    return page
}