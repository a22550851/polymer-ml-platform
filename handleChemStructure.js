
window.addEventListener('load', function() {
    var editor = new Kekule.Editor.Composer(document.getElementById('editor'));
    document.getElementById('convertButton1').addEventListener('click', function() {
        event.preventDefault();
        var molecule = editor.getChemObj();
        var smiles = Kekule.IO.saveFormatData(molecule, 'smi');
        document.getElementById('smilesOutput').textContent = 'SMILES: ' + smiles;
        document.getElementById('donorsmiles').value = smiles;
        
    });
    document.getElementById('convertButton2').addEventListener('click', function() {
        event.preventDefault();
        var molecule = editor.getChemObj();
        var smiles = Kekule.IO.saveFormatData(molecule, 'smi');
        document.getElementById('smilesOutput').textContent = 'SMILES: ' + smiles;
        document.getElementById('acceptorsmiles').value = smiles;
        
    });
});
