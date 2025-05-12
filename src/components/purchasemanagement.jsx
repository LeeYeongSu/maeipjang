import React, { useState, useEffect } from 'react';

const PurchaseManagement = () => {
  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem('purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchaseForm, setPurchaseForm] = useState({
    date: '',
    productCode: '',
    productName: '',
    spec: '',
    unit: '',
    quantity: '',
    price: '',
    supplier: '',
    note: ''
  });

  const [editIndex, setEditIndex] = useState(null);
  const [searchFilter, setSearchFilter] = useState({
    keyword: '',
    date: '',
    supplier: '',
    note: ''
  });

  const fieldLabels = {
    date: '날짜',
    productCode: '제품코드',
    productName: '제품명',
    spec: '규격',
    unit: '단위',
    quantity: '수량',
    price: '단가',
    supplier: '매입처',
    note: '창고명'
  };

  const clearForm = () => {
    setPurchaseForm({
      date: '',
      productCode: '',
      productName: '',
      spec: '',
      unit: '',
      quantity: '',
      price: '',
      supplier: '',
      note: ''
    });
    setEditIndex(null);
  };

  useEffect(() => {
    localStorage.setItem('purchases', JSON.stringify(purchases));
  }, [purchases]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newForm = {
      ...purchaseForm,
      quantity: parseFloat(purchaseForm.quantity) || 0,
      price: parseFloat(purchaseForm.price) || 0
    };

    if (editIndex !== null) {
      const updated = [...purchases];
      updated[editIndex] = newForm;
      setPurchases(updated);
    } else {
      setPurchases([...purchases, newForm]);
    }

    clearForm();
  };

  const handleEdit = (index) => {
    const item = purchases[index];
    setPurchaseForm({
      ...item,
      quantity: item.quantity.toString(),
      price: item.price.toString()
    });
    setEditIndex(index);
  };

  const handleDelete = () => {
    if (editIndex !== null) {
      const updated = purchases.filter((_, i) => i !== editIndex);
      setPurchases(updated);
      clearForm();
    }
  };

  const handleCancel = () => {
    clearForm();
  };

  const handleSaveToFile = () => {
    const blob = new Blob([JSON.stringify(purchases, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'purchases.json';
    a.click();
  };

  const handleLoadFromFile = (e) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      let data = JSON.parse(event.target.result);
      data = data.map(item => ({
        date: item.date || '',
        productCode: item.productCode || '',
        productName: item.productName || '',
        spec: item.spec || '',
        unit: item.unit || '',
        quantity: parseFloat(item.quantity) || 0,
        price: parseFloat(item.price) || 0,
        supplier: item.supplier || '',
        note: item.note || ''
      }));
      setPurchases(data);
      setSearchFilter({ keyword: '', date: '', supplier: '', note: '' });
    };
    fileReader.readAsText(e.target.files[0]);
  };

  const filteredPurchases = purchases.filter((item) => {
    const keywordMatch =
      item.productCode.toLowerCase().includes(searchFilter.keyword.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchFilter.keyword.toLowerCase());

    const dateMatch = searchFilter.date === '' || item.date === searchFilter.date;
    const supplierMatch = item.supplier.toLowerCase().includes(searchFilter.supplier.toLowerCase());
    const noteMatch = item.note.toLowerCase().includes(searchFilter.note.toLowerCase());

    return keywordMatch && dateMatch && supplierMatch && noteMatch;
  });

  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalQuantity = filteredPurchases.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = filteredPurchases.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div style={{ maxWidth: '1000px', margin: 'auto', padding: '20px' }}>
      <h1>매입 자료 관리</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 12px', alignItems: 'start', marginBottom: '10px' }}>
        {Object.entries(purchaseForm).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <label htmlFor={key} style={{ marginBottom: '4px', fontWeight: 'bold' }}>{fieldLabels[key]}</label>
            <input
              id={key}
              name={key}
              list={key + '-list'}
              value={value}
              onChange={handleChange}
              type={key === 'date' ? 'date' : 'text'}
              required={['date', 'productCode', 'productName', 'quantity', 'price'].includes(key)}
              style={{ padding: '8px', fontSize: '14px' }}
            />
            <datalist id={key + '-list'}>
              {[...new Set(purchases.map(item => item[key]).filter(v => v))].map((option, idx) => (
                <option key={idx} value={option} />
              ))}
            </datalist>
          </div>
        ))}
        <div style={{ gridColumn: '1 / -1', textAlign: 'left' }}>
          {editIndex !== null && <button type="button" onClick={handleDelete} style={{ marginRight: '8px' }}>삭제</button>}
          <button type="submit" style={{ marginRight: '8px' }}>{editIndex !== null ? '수정' : '등록'}</button>
          <button type="button" onClick={handleCancel}>취소</button>
        </div>
      </form>

      <div style={{ marginTop: '20px' }}>
        <input type="file" accept=".json" onChange={handleLoadFromFile} />
        <button onClick={handleSaveToFile}>저장</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder="제품명 또는 코드"
          value={searchFilter.keyword}
          onChange={(e) => setSearchFilter(prev => ({ ...prev, keyword: e.target.value }))}
          style={{ padding: '6px', marginRight: '8px' }}
        />
        <input
          type="date"
          value={searchFilter.date}
          onChange={(e) => setSearchFilter(prev => ({ ...prev, date: e.target.value }))}
          style={{ padding: '6px', marginRight: '8px' }}
        />
        <input
          type="text"
          placeholder="매입처"
          value={searchFilter.supplier}
          onChange={(e) => setSearchFilter(prev => ({ ...prev, supplier: e.target.value }))}
          style={{ padding: '6px', marginRight: '8px' }}
        />
        <input
          type="text"
          placeholder="창고명"
          value={searchFilter.note}
          onChange={(e) => setSearchFilter(prev => ({ ...prev, note: e.target.value }))}
          style={{ padding: '6px' }}
        />
      </div>

      <div style={{ marginTop: '20px', height: '230px', overflowY: 'auto' }}>
        <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f0f0f0' }}>
            <tr>
              {Object.keys(fieldLabels).map((key) => (
                <th key={key} style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>{fieldLabels[key]}</th>
              ))}
              <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>수정</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.map((item, index) => (
              <tr key={index}>
                {Object.keys(fieldLabels).map((key) => (
                  <td key={key} style={{ padding: '4px 6px', borderBottom: '1px solid #eee' }}>
                    {(key === 'quantity' || key === 'price')
                      ? formatNumber(item[key])
                      : item[key]}
                  </td>
                ))}
                <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee' }}><button onClick={() => handleEdit(index)}>수정</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={Object.keys(fieldLabels).length + 1} style={{ textAlign: 'right', fontWeight: 'bold', padding: '6px' }}>
                {filteredPurchases.length}개 / 총 {purchases.length}개 &nbsp;&nbsp;
                수량 {formatNumber(totalQuantity)} / 금액 {formatNumber(totalAmount)} 원
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default PurchaseManagement;
