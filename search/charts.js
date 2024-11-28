let defaultData = data;  // 預設數據
let currentData = defaultData;  // 當前使用的數據
const parameters = ['HOMO of Donor (eV)', 'LUMO of Donor (eV)', 'Bandgap of Donor (eV)', 'HOMO of Acceptor (eV)', 'LUMO of Acceptor (eV)', 'Bandgap of Acceptor (eV)', 'PCE (%)', 'Jsc (mAcm-2)', 'Voc (V)', 'FF'];

function processData(json) {
    populateSelect('x-axis', parameters);
}

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    select.innerHTML = '';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.innerHTML = option;
        select.appendChild(opt);
    });
}

function updateYSelect() {
    const xAxis = document.getElementById('x-axis').value;
    const yOptions = parameters.filter(param => param !== xAxis);
    populateSelect('y-axis', yOptions);
    document.getElementById('y-axis').disabled = false;  // 啟用Y軸選擇
}



function updateChart(data) {
    const xAxis = document.getElementById('x-axis').value;
    const yAxis = document.getElementById('y-axis').value;

    const xData = data.map(d => d[xAxis]);
    const yData = data.map(d => d[yAxis]);
    const hoverText = data.map(d => 
        `Materials: ${d["Donor"]} – ${d["Acceptor"]}<br>${xAxis}: ${d[xAxis]}<br>${yAxis}: ${d[yAxis]}`);

    const trace1 = {
        x: xData,
        y: yData,
        text: hoverText,
        mode: 'markers',
        type: 'scatter',
        hoverinfo: 'text',
        name: 'Default Data',
        marker: {
            color: 'black',  // 設置點的顏色為黑色
            size: 6,  // 調整點的大小（可以根據需求調整）
            opacity: 0.8,  // 調整點的透明度（0 到 1 之間，1 為完全不透明）
            line: {
                color: 'white',  // 設置點的邊框顏色
                width: 0.1  // 設置點邊框的寬度
            }
        }
    };



    const layout = {
        title: `${xAxis} vs ${yAxis}`,
        xaxis: { 
            title: `${xAxis}<br><span style="font-size:12px; color:black;">按下數據點，數據點將變為黃色，並可以觀看材料結構及數據</span>` 
        },
        yaxis: { title: yAxis },
        hovermode: 'closest',
        width: 1000,
        height: 800
    };
    
    

    // 渲染圖表
    Plotly.newPlot('chart', [trace1], layout);


    // 顯示輸入框
    document.querySelector('.input-container').style.display = 'flex';

    // 添加點擊事件處理邏輯
    addPlotlyClickEvent('chart', data, 'tableId');
}
function clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除畫布內容
    }
}

// 查找 Donor 的所有 SMILES
function findDonorSmiles(donorName, data) {
    const donorItems = data.filter(item => item.Donor === donorName);
    const donorSmilesList = [...new Set(donorItems.map(item => item['Donor SMILES']))]; // 去重
    console.log(`找到 ${donorName} 的 Donor SMILES:`, donorSmilesList);
    return donorSmilesList;
}

// 查找 Acceptor 的所有 SMILES
function findAcceptorSmiles(acceptorName, data) {
    const acceptorItems = data.filter(item => item.Acceptor === acceptorName);
    const acceptorSmilesList = [...new Set(acceptorItems.map(item => item['Acceptor SMILES']))]; // 去重
    console.log(`找到 ${acceptorName} 的 Acceptor SMILES:`, acceptorSmilesList);
    return acceptorSmilesList;
}


// 綁定按鈕點擊事件
document.getElementById('actionButton').addEventListener('click', function () {
    
    clearCanvas('clickedDonorCanvas1');
    clearCanvas('clickedAcceptorCanvas1');
    
    // 获取输入框中的 Donor 和 Acceptor 值
    const donor = document.getElementById('input1').value.trim();
    const acceptor = document.getElementById('input2').value.trim();

    // 如果兩者皆未輸入，回報錯誤訊息
    if (!donor && !acceptor) {
        alert('請至少輸入一個 Donor 或 Acceptor');
        return;
    }

    let donorSmilesList = [];
    let acceptorSmilesList = [];

    // 如果輸入了 Donor，則查找 Donor 的 SMILES
    if (donor) {
        donorSmilesList = findDonorSmiles(donor, data || []);
        if (donorSmilesList.length === 0) {
            alert(`材料名稱：${donor} 不明材料`);
            return;
        } else if (donorSmilesList.length > 1) {
            alert(`材料名稱：${donor} 有多組 SMILES，請確認`);
            return;
        }
    }

    // 如果輸入了 Acceptor，則查找 Acceptor 的 SMILES
    if (acceptor) {
        acceptorSmilesList = findAcceptorSmiles(acceptor, data || []);
        if (acceptorSmilesList.length === 0) {
            alert(`材料名稱：${acceptor} 不明材料`);
            return;
        } else if (acceptorSmilesList.length > 1) {
            alert(`材料名稱：${acceptor} 有多組 SMILES，請確認`);
            return;
        }
    }

    // 根據輸入的有效組合進行高亮標示
    highlightMaterial(donor || '未輸入', acceptor || '未輸入');
});





function highlightMaterial(donor, acceptor) {
    let donorSmiles = '';
    let acceptorSmiles = '';
    let donorItem = [];
    let acceptorItem = [];
    let matchingItem = [];
    let donorTableHtml = '';
    let acceptorTableHtml = '';
    let performanceTableHtml = '';

    // 透過名稱找到對應的 Donor SMILES
    if (donor) {
        const donorNameItem = currentData.find(item => 
            item.Donor === donor
        );
        donorSmiles = donorNameItem ? donorNameItem['Donor SMILES'] : '';
    }

    // 透過名稱找到對應的 Acceptor SMILES
    if (acceptor) {
        const acceptorNameItem = currentData.find(item => 
            item.Acceptor === acceptor
        );
        acceptorSmiles = acceptorNameItem ? acceptorNameItem['Acceptor SMILES'] : '';
    }

    // 如果找到 Donor SMILES，使用 SMILES 進行匹配
    if (donorSmiles) {
        donorItem = currentData.filter(item => 
            item['Donor SMILES'] === donorSmiles
        );
    }

    // 如果找到 Acceptor SMILES，使用 SMILES 進行匹配
    if (acceptorSmiles) {
        acceptorItem = currentData.filter(item => 
            item['Acceptor SMILES'] === acceptorSmiles
        );
    }

    // 同時匹配 Donor 和 Acceptor SMILES 的組合
    if (donorSmiles && acceptorSmiles) {
        matchingItem = currentData.filter(item => 
            item['Donor SMILES'] === donorSmiles &&
            item['Acceptor SMILES'] === acceptorSmiles
        );
    }

    // 根據匹配的結果更新圖表和表格
    if (donorItem.length > 0 || acceptorItem.length > 0 || matchingItem.length > 0) {
        updateMatchedChart(donorItem, acceptorItem, matchingItem);

        // 渲染化學結構
        if (donorItem.length > 0) {
            renderSmiles(donorSmiles, 'clickedDonorCanvas1', 'Clicked Donor Structure',donor);
            donorTableHtml = createDonorPropertiesTable(donor, currentData);
        }

        if (acceptorItem.length > 0) {
            renderSmiles(acceptorSmiles, 'clickedAcceptorCanvas1', 'Clicked Acceptor Structure', acceptor);
            acceptorTableHtml = createAcceptorPropertiesTable(acceptor, currentData);
        }

        if (matchingItem.length > 0) {
            performanceTableHtml = createDonorAndAcceptorPerformanceTable(donor, acceptor, currentData);
        }

        // 更新表格的 DOM
        const combinedTableHtml = donorTableHtml + acceptorTableHtml + performanceTableHtml;
        document.getElementById('tableId').innerHTML = combinedTableHtml;
        document.getElementById('tableId').style.display = 'block';

        console.log(`Highlighted entries for Donor SMILES: ${donorSmiles}, Acceptor SMILES: ${acceptorSmiles}`);
    } else {
        console.warn(`No matching entries found for Donor: ${donor} and Acceptor: ${acceptor}`);
    }
}













function updateMatchedChart(donorMatchedData, acceptorMatchedData, combinationMatchedData) {
    const xAxis = document.getElementById('x-axis').value;
    const yAxis = document.getElementById('y-axis').value;

    const traces = [];

    // 顯示所有數據點的 trace1
    const trace1 = {
        x: currentData.map(d => d[xAxis]),
        y: currentData.map(d => d[yAxis]),
        text: currentData.map(d => 
            `Materials: ${d["Donor"]} – ${d["Acceptor"]}<br>${xAxis}: ${d[xAxis]}<br>${yAxis}: ${d[yAxis]}`),
        mode: 'markers',
        type: 'scatter',
        hoverinfo: 'text',
        name: 'All Data',  // 所有數據
        marker: {
            color: 'black',  // 使用黑色標示所有數據
            size: 6,
            opacity: 0.7,
            line: {
                color: 'white',
                width: 0.1
            }
        }
    };
    traces.push(trace1);

    // Donor 匹配的數據（紅色）
    if (donorMatchedData.length > 0) {
        const donorTrace = {
            x: donorMatchedData.map(d => d[xAxis]),
            y: donorMatchedData.map(d => d[yAxis]),
            text: donorMatchedData.map(d => 
                `Materials: ${d["Donor"]} – ${d["Acceptor"]}<br>${xAxis}: ${d[xAxis]}<br>${yAxis}: ${d[yAxis]}`),
            mode: 'markers',
            type: 'scatter',
            hoverinfo: 'text',
            name: 'Donor Matched Data',  // Donor匹配數據
            marker: {
                color: 'red',  // 使用紅色標示Donor
                size: 10,
                opacity: 0.8,
                line: {
                    color: 'white',
                    width: 1
                }
            }
        };
        traces.push(donorTrace);
    }

    // Acceptor 匹配的數據（藍色）
    if (acceptorMatchedData.length > 0) {
        const acceptorTrace = {
            x: acceptorMatchedData.map(d => d[xAxis]),
            y: acceptorMatchedData.map(d => d[yAxis]),
            text: acceptorMatchedData.map(d => 
                `Materials: ${d["Donor"]} – ${d["Acceptor"]}<br>${xAxis}: ${d[xAxis]}<br>${yAxis}: ${d[yAxis]}`),
            mode: 'markers',
            type: 'scatter',
            hoverinfo: 'text',
            name: 'Acceptor Matched Data',  // Acceptor匹配數據
            marker: {
                color: 'blue',  // 使用藍色標示Acceptor
                size: 10,
                opacity: 0.8,
                line: {
                    color: 'white',
                    width: 1
                }
            }
        };
        traces.push(acceptorTrace);
    }

    // 同時匹配 Donor 和 Acceptor 的數據（綠色）
    if (combinationMatchedData.length > 0) {
        const combinationTrace = {
            x: combinationMatchedData.map(d => d[xAxis]),
            y: combinationMatchedData.map(d => d[yAxis]),
            text: combinationMatchedData.map(d => 
                `Materials: ${d["Donor"]} – ${d["Acceptor"]}<br>${xAxis}: ${d[xAxis]}<br>${yAxis}: ${d[yAxis]}`),
            mode: 'markers',
            type: 'scatter',
            hoverinfo: 'text',
            name: 'Combination Matched Data',  // 組合匹配數據
            marker: {
                color: 'green',  // 使用綠色標示Donor和Acceptor組合
                size: 10,
                opacity: 0.8,
                line: {
                    color: 'white',
                    width: 1
                }
            }
        };
        traces.push(combinationTrace);
    }


    

    const layout = {
        title: `${xAxis} vs ${yAxis}`,
        xaxis: { title: xAxis },
        yaxis: { title: yAxis },
        hovermode: 'closest',
        width: 1000,
        height: 800
    };

    // 渲染圖表，顯示所有數據點和匹配數據點，並添加對角線
    Plotly.newPlot('chart', traces, layout);

    addPlotlyClickEvent('chart', data, 'tableId');
}





















document.getElementById('x-axis').addEventListener('change', () => {
    updateYSelect();
    updateChart(currentData);
});

document.getElementById('y-axis').addEventListener('change', () => updateChart(currentData));

// 初次加載圖表
processData(defaultData);