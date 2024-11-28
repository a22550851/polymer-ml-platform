function getValuesForDonor(donorName, metric, data) {
    // 找到與 donorName 對應的 Donor SMILES
    const donorSmilesItem = data.find(item => item.Donor === donorName);

    // 如果沒有找到對應的供體，返回空陣列
    if (!donorSmilesItem) {
        return [];
    }

    const donorSmiles = donorSmilesItem['Donor SMILES'];

    // 使用 Donor SMILES 過濾出所有與該 SMILES 匹配的項目
    const matchedItems = data.filter(item => item['Donor SMILES'] === donorSmiles);

    // 提取所有匹配項目的指定性能指標的值
    const values = matchedItems.map(item => item[metric]);

    return values;
}
function calculateMeanAndStdDevForDonor(donorName, data) {
    // 定義要計算的性質指標
    const metrics = ['HOMO of Donor (eV)', 'LUMO of Donor (eV)', 'Bandgap of Donor (eV)'];
    let results = {};

    // 對每個性質指標進行計算
    metrics.forEach(metric => {
        // 使用 getValuesForDonor 函數提取數據
        const values = getValuesForDonor(donorName, metric, data);

        if (values.length === 0) {
            results[metric] = { mean: 'N/A', stdDev: 'N/A' };
        } else {
            // 計算平均值
            const mean = (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2);

            // 計算標準差
            const stdDev = Math.sqrt(values.map(value => Math.pow(value - mean, 2)).reduce((sum, value) => sum + value, 0) / values.length).toFixed(2);

            // 存儲結果
            results[metric] = { mean, stdDev };
        }
    });

    return results;
}

function getValuesForAcceptor(acceptorName, metric, data) {
    // 找到與 acceptorName 對應的 Acceptor SMILES
    const acceptorSmilesItem = data.find(item => item.Acceptor === acceptorName);

    // 如果沒有找到對應的受體，返回空陣列
    if (!acceptorSmilesItem) {
        return [];
    }

    const acceptorSmiles = acceptorSmilesItem['Acceptor SMILES'];

    // 使用 Acceptor SMILES 過濾出所有與該 SMILES 匹配的項目
    const matchedItems = data.filter(item => item['Acceptor SMILES'] === acceptorSmiles);

    // 提取所有匹配項目的指定性能指標的值
    const values = matchedItems.map(item => item[metric]);

    return values;
}
function calculateMeanAndStdDevForAcceptor(acceptorName, data) {
    // 定義要計算的性質指標
    const metrics = ['HOMO of Acceptor (eV)', 'LUMO of Acceptor (eV)', 'Bandgap of Acceptor (eV)'];
    let results = {};

    // 對每個性質指標進行計算
    metrics.forEach(metric => {
        // 使用 getValuesForAcceptor 函數提取數據
        const values = getValuesForAcceptor(acceptorName, metric, data);

        if (values.length === 0) {
            results[metric] = { mean: 'N/A', stdDev: 'N/A' };
        } else {
            // 計算平均值
            const mean = (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2);

            // 計算標準差
            const stdDev = Math.sqrt(values.map(value => Math.pow(value - mean, 2)).reduce((sum, value) => sum + value, 0) / values.length).toFixed(2);

            // 存儲結果
            results[metric] = { mean, stdDev };
        }
    });

    return results;
}

// 主函數：取得對應 metric 的值
function getValuesForDonorAndAcceptor(donorName, acceptorName, metric, data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error("資料不可用或為空陣列");
        return [];
    }

    // 查找 Donor 和 Acceptor 的所有 SMILES
    const donorSmilesList = findDonorSmiles(donorName, data);
    const acceptorSmilesList = findAcceptorSmiles(acceptorName, data);

    let matchedItems;

    if (donorSmilesList.length > 1 || acceptorSmilesList.length > 1) {
        console.log("多個 SMILES 對應，使用名稱匹配");
        // 若有多個 SMILES，使用名稱進行篩選
        matchedItems = data.filter(
            item => item.Donor === donorName && item.Acceptor === acceptorName
        );
    } else {
        console.log("單一 SMILES 對應，使用 SMILES 匹配");
        // 若名稱對應單一 SMILES，使用 SMILES 進行篩選
        const donorSmiles = donorSmilesList[0] || null;
        const acceptorSmiles = acceptorSmilesList[0] || null;

        if (!donorSmiles || !acceptorSmiles) {
            console.warn("無法找到對應的 Donor 或 Acceptor SMILES");
            return [];
        }

        matchedItems = data.filter(
            item =>
                item['Donor SMILES'] === donorSmiles &&
                item['Acceptor SMILES'] === acceptorSmiles
        );
    }

    console.log(`篩選出的項目數量: ${matchedItems.length}`);

    if (matchedItems.length > 0 && !(metric in matchedItems[0])) {
        console.error(`Metric "${metric}" 不存在於資料中`);
        return [];
    }

    const values = matchedItems.map(item => item[metric]);
    console.log(`取得的 ${metric} 值:`, values);

    return values;
}

function calculateMeanAndStdDevForDonorAndAcceptor(donorName, acceptorName, data) {
    // 定義要計算的性能指標
    const metrics = ['PCE (%)', 'Jsc (mAcm-2)', 'Voc (V)', 'FF'];
    let results = {};

    // 對每個性能指標進行計算
    metrics.forEach(metric => {
        // 使用 getValuesForDonorAndAcceptor 函數提取數據
        const values = getValuesForDonorAndAcceptor(donorName, acceptorName, metric, data);

        if (values.length === 0) {
            results[metric] = { mean: 'N/A', stdDev: 'N/A' };
        } else {
            // 計算平均值
            const mean = (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2);

            // 計算標準差
            const stdDev = Math.sqrt(values.map(value => Math.pow(value - mean, 2)).reduce((sum, value) => sum + value, 0) / values.length).toFixed(2);

            // 存儲結果
            results[metric] = { mean, stdDev };
        }
    });

    return results;
}
function createDonorAndAcceptorPerformanceTable(donorName, acceptorName, data) {
    // 1. 使用 calculateMeanAndStdDevForDonorAndAcceptor 計算性能數據
    const results = calculateMeanAndStdDevForDonorAndAcceptor(donorName, acceptorName, data);

    // 2. 查找 Donor 和 Acceptor 的所有 SMILES
    const donorSmilesList = findDonorSmiles(donorName, data);
    const acceptorSmilesList = findAcceptorSmiles(acceptorName, data);

    let matchedItem;

    // 3. 根據多重 SMILES 決定篩選邏輯
    if (donorSmilesList.length > 1 || acceptorSmilesList.length > 1) {
        console.log("多個 SMILES 對應，使用名稱匹配");
        // 多個 SMILES 時，使用名稱匹配
        matchedItem = data.find(
            item => item.Donor === donorName && item.Acceptor === acceptorName
        );
    } else {
        console.log("單一 SMILES 對應，使用 SMILES 匹配");
        // 單一 SMILES 時，使用 SMILES 匹配
        const donorSmiles = donorSmilesList[0] || null;
        const acceptorSmiles = acceptorSmilesList[0] || null;

        if (!donorSmiles || !acceptorSmiles) {
            console.warn("無法找到對應的 Donor 或 Acceptor 的 SMILES。");
            return `<p>無法找到 ${donorName} 和 ${acceptorName} 的性能數據。</p>`;
        }

        matchedItem = data.find(
            item =>
                item['Donor SMILES'] === donorSmiles &&
                item['Acceptor SMILES'] === acceptorSmiles
        );
    }

    // 4. 檢查是否找到匹配的項目
    if (!matchedItem) {
        console.warn("無法找到符合條件的數據。");
        return `<p>無法找到符合條件的數據。</p>`;
    }

    // 5. 建立 HTML 表格樣式
    let tableHtml = '';
    const tableStyle = 'border: 1px solid black; border-collapse: collapse; width: 100%;';
    const thStyle = 'border: 1px solid black; padding: 8px; background-color: #f2f2f2; text-align: center;';
    const tdStyle = 'border: 1px solid black; padding: 8px; text-align: center;';

    tableHtml += `<h3>${donorName} / ${acceptorName} 的性能數據</h3>`;
    tableHtml += `<table style="${tableStyle}">`;
    tableHtml += `<tr><th style="${thStyle}">參數</th><th style="${thStyle}">實驗平均值 ± 標準差</th><th style="${thStyle}">預測值</th><th style="${thStyle}">誤差</th></tr>`;

    // 6. 生成表格內容
    Object.entries(results).forEach(([metric, stats]) => {
        const predictedValue = matchedItem[`${metric}.1`];
        const formattedPredictedValue = predictedValue.toPrecision(3);  // 格式化為三位有效數字
        const error = calculateError(stats.mean, predictedValue);

        tableHtml += `<tr><td style="${tdStyle}">${metric}</td><td style="${tdStyle}">${stats.mean} ± ${stats.stdDev}</td><td style="${tdStyle}">${formattedPredictedValue}</td><td style="${tdStyle}">${error}%</td></tr>`;
    });

    tableHtml += '</table>';
    return tableHtml;
}






function createDonorPropertiesTable(donorName, data) {
    const results = calculateMeanAndStdDevForDonor(donorName, data);

    let tableHtml = '';
    const tableStyle = 'border: 1px solid black; border-collapse: collapse; width: 100%;';
    const thStyle = 'border: 1px solid black; padding: 8px; background-color: #f2f2f2; text-align: center;';
    const tdStyle = 'border: 1px solid black; padding: 8px; text-align: center;';

    tableHtml += `<h3>${donorName} 的 Donor 性質</h3>`;
    tableHtml += `<table style="${tableStyle}">`;
    tableHtml += `<tr><th style="${thStyle}">參數</th><th style="${thStyle}">實驗平均值 ± 標準差</th><th style="${thStyle}">預測值</th><th style="${thStyle}">誤差</th></tr>`;

    Object.entries(results).forEach(([metric, stats]) => {
        const predictedValue = data.find(item => item.Donor === donorName)[`${metric}.1`];
        const formattedPredictedValue = predictedValue.toPrecision(3);  // 格式化為三位有效數字
        const error = calculateError(stats.mean, predictedValue);

        tableHtml += `<tr><td style="${tdStyle}">${metric}</td><td style="${tdStyle}">${stats.mean} ± ${stats.stdDev}</td><td style="${tdStyle}">${formattedPredictedValue}</td><td style="${tdStyle}">${error}%</td></tr>`;
    });

    tableHtml += '</table>';
    return tableHtml;
}


function createAcceptorPropertiesTable(acceptorName, data) {
    const results = calculateMeanAndStdDevForAcceptor(acceptorName, data);

    let tableHtml = '';
    const tableStyle = 'border: 1px solid black; border-collapse: collapse; width: 100%;';
    const thStyle = 'border: 1px solid black; padding: 8px; background-color: #f2f2f2; text-align: center;';
    const tdStyle = 'border: 1px solid black; padding: 8px; text-align: center;';

    tableHtml += `<h3>${acceptorName} 的 Acceptor 性質</h3>`;
    tableHtml += `<table style="${tableStyle}">`;
    tableHtml += `<tr><th style="${thStyle}">參數</th><th style="${thStyle}">實驗平均值 ± 標準差</th><th style="${thStyle}">預測值</th><th style="${thStyle}">誤差</th></tr>`;

    Object.entries(results).forEach(([metric, stats]) => {
        const predictedValue = data.find(item => item.Acceptor === acceptorName)[`${metric}.1`];
        const formattedPredictedValue = predictedValue.toPrecision(3);  // 格式化為三位有效數字
        const error = calculateError(stats.mean, predictedValue);

        tableHtml += `<tr><td style="${tdStyle}">${metric}</td><td style="${tdStyle}">${stats.mean} ± ${stats.stdDev}</td><td style="${tdStyle}">${formattedPredictedValue}</td><td style="${tdStyle}">${error}%</td></tr>`;
    });

    tableHtml += '</table>';
    return tableHtml;
}














function calculateError(actual, predicted) {
    if (actual === 0) return 0;  // 防止除以零
    return ((Math.abs(predicted - actual) / Math.abs(actual)) * 100).toFixed(2);
}




// 初始化時調用此函數
addPlotlyClickEvent('chart', data, 'table');