function highlightClickedPoint(eventData) {
    const pointIndex = eventData.points[0].pointIndex;  // 獲取被點擊點的索引
    const update = {
        marker: {
            color: [],  // 初始化顏色數組
            size: [],   // 初始化大小數組
            opacity: [], // 初始化透明度數組
            line: {
                color: [],  // 初始化邊框顏色數組
                width: []   // 初始化邊框寬度數組
            }
        }
    };

    // 為所有點設置默認屬性
    for (let i = 0; i < currentData.length; i++) {
        update.marker.color[i] = 'black';      // 默認設為黑色
        update.marker.size[i] = 6;             // 設置點的大小為6
        update.marker.opacity[i] = 0.8;        // 設置點的透明度為0.7
        update.marker.line.color[i] = 'white'; // 設置點的邊框顏色為白色
        update.marker.line.width[i] = 0.1;       // 設置點的邊框寬度為1
    }

    // 將被點擊的點設為黃色並增大大小
    update.marker.color[pointIndex] = 'yellow';
    update.marker.size[pointIndex] = 10;       // 增加被點擊點的大小以更顯眼

    // 更新圖表
    Plotly.restyle('chart', update, [0]);
}


// 更新addPlotlyClickEvent函數，將highlightClickedPoint加入
function addPlotlyClickEvent(chartId, data, tableId) {
    const chartElement = document.getElementById(chartId);

    if (!chartElement) {
        console.error(`No DOM element with ID '${chartId}' found.`);
        return;
    }

    chartElement.on('plotly_click', function(eventData) {
        // 呼叫highlightClickedPoint函數
        highlightClickedPoint(eventData);

        const point = eventData.points[0];
        const label = point.text;

        // 清理標籤並提取 Donor 和 Acceptor 名稱
        const cleanLabel = label.replace('Materials: ', '').split('<br>')[0];
        const [donor, acceptor] = cleanLabel.split('–').map(s => s.trim());

        // 查找對應的數據項目
        const item = data.find(d => d.Donor.trim() === donor && d.Acceptor.trim() === acceptor);

        if (item) {
            // 渲染化學結構圖並標示 clicked donor structure 和 clicked acceptor structure
            renderSmiles(item['Donor SMILES'], 'clickedDonorCanvas1', 'Clicked Donor Structure', item['Donor']);
            renderSmiles(item['Acceptor SMILES'], 'clickedAcceptorCanvas1', 'Clicked Acceptor Structure', item['Acceptor']);

            // 生成 Donor 性質表
            const donorTableHtml = createDonorPropertiesTable(donor, data);

            // 生成 Acceptor 性質表
            const acceptorTableHtml = createAcceptorPropertiesTable(acceptor, data);

            // 生成 Donor 和 Acceptor 的性能表
            const performanceTableHtml = createDonorAndAcceptorPerformanceTable(donor, acceptor, data);

            // 合併所有表格
            const combinedTableHtml = donorTableHtml + acceptorTableHtml + performanceTableHtml;

            // 插入表格
            const tableElement = document.getElementById(tableId);
            if (tableElement) {
                tableElement.innerHTML = combinedTableHtml;
                tableElement.style.display = 'block';
            } else {
                console.error(`No DOM element with ID '${tableId}' found.`);
            }
        } else {
            console.warn('未找到匹配的數據項目');
        }
    });
}


