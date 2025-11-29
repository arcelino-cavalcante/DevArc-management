export const formatCurrency = (value) => {
    if (value === undefined || value === null || value === '') return 'R$ 0,00';
    const number = parseFloat(value);
    if (isNaN(number)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(number);
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
    } catch (error) {
        return 'Data inválida';
    }
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'Ativo': return 'bg-green-100 text-green-800';
        case 'Pendente': return 'bg-yellow-100 text-yellow-800';
        case 'Concluído': return 'bg-blue-100 text-blue-800';
        case 'Atrasado': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};
