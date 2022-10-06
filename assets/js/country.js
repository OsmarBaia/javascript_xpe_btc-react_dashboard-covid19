//HTML
//HTML__FILTER
const html__input__endDate = document.querySelector('#date_end');
const html__dropDown__dataType = document.querySelector('#cmbData');
const html__input__startDate = document.querySelector('#date_start');
const html__dropDown__countries = document.querySelector('#cmbCountry');
const html__button__search = document.querySelector('#filtro');

//HTML__KPI
const html__text__kpiDeaths = document.querySelector('#kpiDeaths');
const html__text__kpiRecovered = document.querySelector('#kpiConfirmed');
const html__text__kpiConfirmed = document.querySelector('#kpiRecovered');

const html__text__avgDeaths     = document.querySelector('#avgDeaths');
const html__text__avgRecovered  = document.querySelector('#avgRecovered');
const html__text__avgConfirmed  = document.querySelector('#avgConfirmed');

//HTML__CHART
const html__canvas__chart = document.querySelector('#linhas');

//JS
let countriesData = null;
let countrySlug = 'brazil';

let start_date = '';
let end_date = '';
let data_type = '';

let countryData = null;
let countryDataByPeriod = null;

//Chart
let lineChart = new Chart(html__canvas__chart, null);

function SetDropDownValues(_valuesArr){
    _valuesArr.forEach(
        function (item) {
            let option = document.createElement('option');
            option.text = item.Country;
            option.value = item.Slug;
            html__dropDown__countries.add(option);
        }
    );
    html__dropDown__countries.value = countrySlug;
}

async function FetchCountriesData(){
    const COUNTRIES_DATA       =   await   axios.get('https://api.covid19api.com/countries');
    countriesData =  _.orderBy(COUNTRIES_DATA.data, ["Country"], ["asc"]);
}

function SetDates(_start_date, _end_date){
    const formattedFirstDay = _start_date.slice(0, _start_date.indexOf('T'));
    const formattedLastDay = _end_date.slice(0, _end_date.indexOf('T'));

    start_date  = formattedFirstDay;
    end_date    = formattedLastDay;

    //Start Day
    html__input__startDate.value    = formattedFirstDay;
    html__input__startDate.min      = formattedFirstDay;
    html__input__startDate.max      = formattedLastDay;

    //End Day
    html__input__endDate.value      = formattedLastDay;
    html__input__endDate.max        = formattedLastDay;
    html__input__endDate.min        = formattedFirstDay;
}

async function FetchCountryData(_countrySlug){
    const COUNTRY_DATA    =   await   axios.get(`https://api.covid19api.com/total/dayone/country/${_countrySlug}`);
    countryData = _.sortBy(COUNTRY_DATA.data, 'Date');
    // Dates
    let firstDay  = (_.first(countryData)).Date;
    let lastDay =  (_.last(countryData)).Date;

    SetDates(firstDay, lastDay);

    //Data Type
    data_type = 'Deaths';
    html__dropDown__dataType.value  = 'Deaths';
}

async function FetchCountryDataByDate(_countrySlug, _start_date, _end_date) {
    const COUNTRY_DATA =   await   axios.get(`https://api.covid19api.com/country/${_countrySlug}?from=${_start_date}&to=${_end_date}`);
    countryDataByPeriod = COUNTRY_DATA.data;
}

function GetCountryDates(_countrySlug){
    console.log(`Buscando Datas de '${_countrySlug}'! Por favor aguarde!`)
    FetchCountryData(_countrySlug).then( () => {
            console.log('Carregamento de Datas Finalizado!')
            GetCountryData(countrySlug, start_date, end_date, data_type);
        }
    ).catch( e => console.log(`Error na requisição de Datas para ${_countrySlug}! Track: `+e))
}

function GetCountryData(_countrySlug, _start_date, _end_date, _data_type){
    console.log(`Buscando ${_data_type} em '${_countrySlug}' entre ${_start_date} e ${_end_date}!`)
    FetchCountryDataByDate(_countrySlug, _start_date, _end_date).then( () => {
            console.log(`Busca de realizada com sucesso!`)
            KPI_Chart(countryDataByPeriod);
            Line_Chart(countryDataByPeriod, _data_type)
        }
        ).catch( e =>
            console.log(`Error! Falha na requisição de ${_data_type} em ${_countrySlug} entre ${_start_date} e ${_end_date}  Track: ${e}`)
        )
}

function GetDayTotalValues(_valuesArr, _arrProperty){
    let tempArr     = _.map(_valuesArr,_arrProperty);
    return _.map(tempArr, function (element) {
        let index = tempArr.indexOf(element);
        if(index > 0){
            return tempArr[index] - tempArr[index -1]
        }else{
            return tempArr[index+1] - tempArr[index]
        }
    });
}

function KPI_Chart(_dataArr){
    let kpiDeaths       =   _.sum(GetDayTotalValues(_dataArr, 'Deaths'));
    let kpiConfirmed    =   _.sum(GetDayTotalValues(_dataArr, 'Confirmed'));
    let kpiRecovered    =   _.sum(GetDayTotalValues(_dataArr, 'Recovered'));

    let avgDeaths       =   _.mean(GetDayTotalValues(_dataArr, 'Deaths')).toFixed(0);
    let avgConfirmed    =   _.mean(GetDayTotalValues(_dataArr, 'Confirmed')).toFixed(0);
    let avgRecovered    =   _.mean(GetDayTotalValues(_dataArr, 'Recovered')).toFixed(0);

    html__text__kpiDeaths.innerHTML     =   kpiDeaths.toLocaleString();
    html__text__kpiRecovered.innerHTML  =   kpiRecovered.toLocaleString();
    html__text__kpiConfirmed.innerHTML  =   kpiConfirmed.toLocaleString();

    html__text__avgDeaths.innerHTML       =     avgDeaths;
    html__text__avgRecovered.innerHTML    =     avgRecovered;
    html__text__avgConfirmed.innerHTML    =     avgConfirmed;
}

function GetDayAverages(_valuesArr, _arrProperty){
    let tempArr = GetDayTotalValues(_valuesArr, _arrProperty);

    return _.map(tempArr, function (element) {
        let index = tempArr.indexOf(element);
        if(index > 0){
            return (tempArr[index] + tempArr[index -1])/2;
        }else{
            return (tempArr[index+1] + tempArr[index])/2;
        }
    });
}

function GetTotalAverage(_data_type){
    switch (_data_type){
        case 'Confirmed':
            return html__text__avgConfirmed.innerHTML;
        case 'Recovered':
            return html__text__avgRecovered.innerHTML;
        default:
            return html__text__avgDeaths.innerHTML;
    }
}

function Line_Chart(_dataArr, _data_type){
    lineChart.destroy();

    let charValues              = GetDayTotalValues(_dataArr, _data_type);
    let chart_localAverage      = GetDayAverages(_dataArr,  _data_type);
    let chart_totalAverage      = _.map(_dataArr, () => GetTotalAverage(_data_type));

    let chart_borderColor;
    let chart_backgroundColor;
    let chart_title;
    let chart_label;

    switch (_data_type){
        case 'Confirmed':
            chart_borderColor = 'rgb(0,51,180)';
            chart_backgroundColor = 'rgba(0,51,180,0.3)';
            chart_title='Gráfico de Confirmação x Tempo';
            chart_label='Casos Confirmados';
            break;
        case 'Recovered':
            chart_borderColor = 'rgb(17,168,0)';
            chart_backgroundColor = 'rgba(17,168,0,0.3)';
            chart_title='Gráfico de Recuperação x Tempo';
            chart_label='Casos de Recuperação';
            break;
        default:
            chart_borderColor = 'rgb(180,0,0)';
            chart_backgroundColor = 'rgba(180,0,0,0.3)';
            chart_title='Gráfico de Morte x Tempo';
            chart_label='Casos de Morte';
            break;
    }

    chart_labels = _.map(_dataArr, 'Date');
    chart_data = {
        labels: chart_labels,
        datasets: [
            {
                label: chart_label,
                data: charValues,
                borderColor: chart_borderColor,
                backgroundColor: chart_backgroundColor,
            },
            {
                label: 'Média Móvel',
                data: chart_localAverage,
                borderColor: 'rgb(234,191,17)',
                backgroundColor: 'rgba(234,191,17,0.3)',
            },
            {
                label: 'Média Total',
                data: chart_totalAverage,
                borderColor: 'rgb(234,126,17)',
                backgroundColor: 'rgba(234,126,17,0.3)',
            }
        ]
    };
    config = {
        type: 'line',
        data: chart_data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: chart_title
                }
            }
        },
    };

    lineChart = new Chart(html__canvas__chart, config);
}

//JS__Event
html__input__startDate.addEventListener('change', () =>{
    start_date = html__input__startDate.value;
});
html__input__endDate.addEventListener('change', () =>{
    end_date = html__input__endDate.value;
});
html__dropDown__countries.addEventListener('change', () =>{
    countrySlug = html__dropDown__countries.value;
    GetCountryDates(countrySlug);
});
html__dropDown__dataType.addEventListener('change', () => {
    data_type = html__dropDown__dataType.value;
});
html__button__search.addEventListener('click', () => {
    GetCountryData(countrySlug, start_date, end_date, data_type);
});

//JS__Init
function Country(){
    FetchCountriesData().then(() =>
        {
            SetDropDownValues(countriesData);
            GetCountryDates(countrySlug);
        }
    ).catch(e => console.log('Error ao tentar conectar a API\nTrack: '+e))
}
Country();
