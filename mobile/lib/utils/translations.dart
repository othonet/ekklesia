class Translations {
  // Traduções de estado civil
  static String translateMaritalStatus(String? status) {
    if (status == null) return '';
    switch (status.toUpperCase()) {
      case 'SINGLE':
        return 'Solteiro(a)';
      case 'MARRIED':
        return 'Casado(a)';
      case 'DIVORCED':
        return 'Divorciado(a)';
      case 'WIDOWED':
        return 'Viúvo(a)';
      default:
        return status;
    }
  }

  // Traduções de status de membro
  static String translateMemberStatus(String? status) {
    if (status == null) return '';
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'Ativo';
      case 'INACTIVE':
        return 'Inativo';
      case 'PENDING':
        return 'Pendente';
      default:
        return status;
    }
  }

  // Traduções de status de curso
  static String translateCourseStatus(String? status) {
    if (status == null) return '';
    switch (status.toUpperCase()) {
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'COMPLETED':
        return 'Concluído';
      case 'ABANDONED':
        return 'Abandonado';
      default:
        return status;
    }
  }
}

