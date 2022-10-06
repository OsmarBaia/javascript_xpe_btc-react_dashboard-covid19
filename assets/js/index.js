//HTML__KPI
const html__text__confirmed     = document.querySelector('#confirmed');
const html__text__deaths        = document.querySelector('#death');
const html__text__recovered     = document.querySelector('#recovered')
const html__text__lastUpdate    = document.querySelector('#date');
//HTML__PIE
const html__canvas__pieGraphic  = document.querySelector('#pizza');
//HTML__BARS
const html__canvas__BarChart    = document.querySelector('#barras');

//JS
const summary_url = 'https://api.covid19api.com/summary';
//JS__KPI
let totalDeaths     = 0;
let totalRecovered  = 0;
let totalConfirmed  =  0;
let lastUpdateDate  = '';

//JS__PIE
let newDeaths       = 0;
let newRecovered    = 0;
let newConfirmed    = 0;
//JS__BARS
let countries       = null;

//JS__FUNC
async function FetchData(){
    const COUNTRIES_DATA = await axios.get(summary_url);

    //KPI
    totalDeaths     = COUNTRIES_DATA.data.Global.TotalDeaths.toLocaleString("pt-BR");
    totalRecovered  = COUNTRIES_DATA.data.Global.TotalRecovered.toLocaleString("pt-BR");
    totalConfirmed  = COUNTRIES_DATA.data.Global.TotalConfirmed.toLocaleString("pt-BR");
    lastUpdateDate  = COUNTRIES_DATA.data.Global.Date.toLocaleString("pt-BR");

    newDeaths       = COUNTRIES_DATA.data.Global.NewConfirmed.toLocaleString("pt-BR");
    newRecovered    = COUNTRIES_DATA.data.Global.NewDeaths.toLocaleString("pt-BR");
    newConfirmed    = COUNTRIES_DATA.data.Global.NewRecovered.toLocaleString("pt-BR");

    countries   =   _.orderBy(COUNTRIES_DATA.data.Countries, ["TotalDeaths"], ["desc"]);

    console.log(COUNTRIES_DATA.data.Global)
}

function KPI_Chart(_deaths, _recovered, _confirmed, _date){
    html__text__deaths.innerHTML =   _deaths;
    html__text__recovered.innerHTML =  _recovered;
    html__text__confirmed.innerHTML =  _confirmed;
    html__text__lastUpdate.innerHTML =  `Data de atualização: ${_date}`;
}

function PIE_Chart(_deaths,_recovered, _confirmed){
    const data = {
        labels:  [
            'Mortes',
            'Confirmados',
            'Recuperados',
        ],
        datasets: [{
            label: 'Numero de casos',
            backgroundColor: ['rgb(255, 99, 132)','rgb(0,93,243)', 'rgb(99,255,102)'],
            borderColor: ['rgb(255, 99, 132)','rgb(0,93,243)', 'rgb(99,255,102)'],
            data: [_deaths, _confirmed, _recovered],
        }]
    };
    const config = {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Distribuição de novos casos'
                }
            }
        },
    };
    const chart_pie = new Chart(html__canvas__pieGraphic, config);
}

function BAR_Chart(_countriesArr){
    const countriesColors = [
        'rgb(128,0,0)',
        'rgb(178,34,34)',
        'rgb(255,127,80)',
        'rgb(233,150,122)',
        'rgb(255,69,0)',
        'rgb(255,165,0)',
        'rgb(255,215,0)',
        'rgb(238,232,170)',
        'rgb(0,128,128)',
        'rgb(64,224,208)',
    ]

    const labels =  _countriesArr.map(c => {return c.Country;}).slice(0,10);
    const data = {
        labels: labels,
        datasets: [{
            label: 'Numero de Mortes',
            backgroundColor: countriesColors,
            borderColor: countriesColors,
            data: _countriesArr.map(c => {return c.TotalDeaths;}).slice(0,10),
        }]
    };
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Ranking de países com maior número de mortes'
                }
            }
        },
    };
    const chart_bar = new Chart(html__canvas__BarChart, config);
}

function Index(){
    FetchData().then( () =>{
            KPI_Chart(totalDeaths, totalRecovered, totalConfirmed, lastUpdateDate);
            PIE_Chart(newDeaths, newRecovered, newConfirmed);
            BAR_Chart(countries);
            console.log('Carregamento Bem-Sucedido!')
    }
    ).catch( e =>
        console.log('Error ao tentar recuperar dados da API\n'+e)
    );
}

//JS__INIT
Index();