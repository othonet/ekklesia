import '../models/member.dart';

class BirthdayHelper {
  /// Verifica se hoje é o aniversário do membro
  static bool isBirthdayToday(Member member) {
    if (member.birthDate == null) {
      print('🎂 BirthdayHelper: birthDate é null para ${member.name}');
      return false;
    }
    
    final today = DateTime.now();
    final birthDate = member.birthDate!;
    
    // Converter para UTC para evitar problemas de timezone
    // Quando a data vem como "1956-12-03 00:00:00.000Z", precisamos usar UTC
    final birthDateUTC = birthDate.isUtc ? birthDate : birthDate.toUtc();
    final todayUTC = DateTime.utc(today.year, today.month, today.day);
    
    // Comparar apenas dia e mês usando valores UTC (ignorar ano e hora)
    final isBirthday = todayUTC.month == birthDateUTC.month && 
                       todayUTC.day == birthDateUTC.day;
    
    print('🎂 BirthdayHelper: Verificando aniversário para ${member.name}');
    print('   Data de nascimento (original): ${birthDate.day}/${birthDate.month}/${birthDate.year}');
    print('   Data de nascimento (isUtc: ${birthDate.isUtc}): ${birthDateUTC.day}/${birthDateUTC.month}/${birthDateUTC.year}');
    print('   Data de hoje (local): ${today.day}/${today.month}/${today.year}');
    print('   Data de hoje (UTC): ${todayUTC.day}/${todayUTC.month}/${todayUTC.year}');
    print('   Comparação: ${birthDateUTC.day}/${birthDateUTC.month} vs ${todayUTC.day}/${todayUTC.month}');
    print('   É aniversário? $isBirthday');
    
    return isBirthday;
  }

  /// Obtém um versículo aleatório para aniversário
  static BirthdayVerse getRandomBirthdayVerse() {
    final random = DateTime.now().day; // Usar o dia do mês como seed
    final verses = _birthdayVerses;
    return verses[random % verses.length];
  }

  /// Lista de versículos para aniversário
  static final List<BirthdayVerse> _birthdayVerses = [
    BirthdayVerse(
      verse: 'Os teus olhos viram o meu corpo ainda informe; e no teu livro todas estas coisas foram escritas; as quais em continuação foram formadas, quando nem ainda uma delas havia.',
      reference: 'Salmos 139:16',
    ),
    BirthdayVerse(
      verse: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.',
      reference: 'Jeremias 29:11',
    ),
    BirthdayVerse(
      verse: 'O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti, e tenha misericórdia de ti; o Senhor sobre ti levante o seu rosto e te dê a paz.',
      reference: 'Números 6:24-26',
    ),
    BirthdayVerse(
      verse: 'Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.',
      reference: 'Jeremias 29:11',
    ),
    BirthdayVerse(
      verse: 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
      reference: 'Provérbios 3:5-6',
    ),
    BirthdayVerse(
      verse: 'Tudo posso naquele que me fortalece.',
      reference: 'Filipenses 4:13',
    ),
    BirthdayVerse(
      verse: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
      reference: 'João 3:16',
    ),
    BirthdayVerse(
      verse: 'O Senhor é o meu pastor; nada me faltará.',
      reference: 'Salmos 23:1',
    ),
    BirthdayVerse(
      verse: 'Porque para Deus nada é impossível.',
      reference: 'Lucas 1:37',
    ),
    BirthdayVerse(
      verse: 'Entrega o teu caminho ao Senhor; confia nele, e ele o fará.',
      reference: 'Salmos 37:5',
    ),
    BirthdayVerse(
      verse: 'Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão, e não se cansarão; andarão, e não se fatigarão.',
      reference: 'Isaías 40:31',
    ),
    BirthdayVerse(
      verse: 'Porque eu sou o Senhor, teu Deus, que te seguro pela tua mão direita, e te digo: Não temas; eu te ajudarei.',
      reference: 'Isaías 41:13',
    ),
    BirthdayVerse(
      verse: 'O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti, e tenha misericórdia de ti.',
      reference: 'Números 6:24-25',
    ),
    BirthdayVerse(
      verse: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.',
      reference: 'Jeremias 29:11',
    ),
    BirthdayVerse(
      verse: 'Tudo tem o seu tempo determinado, e há tempo para todo o propósito debaixo do céu.',
      reference: 'Eclesiastes 3:1',
    ),
    BirthdayVerse(
      verse: 'Porque eu sou o Senhor, teu Deus, que te seguro pela tua mão direita, e te digo: Não temas; eu te ajudarei.',
      reference: 'Isaías 41:13',
    ),
    BirthdayVerse(
      verse: 'O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?',
      reference: 'Salmos 27:1',
    ),
    BirthdayVerse(
      verse: 'Porque eu sou o Senhor, teu Deus, que te seguro pela tua mão direita, e te digo: Não temas; eu te ajudarei.',
      reference: 'Isaías 41:13',
    ),
    BirthdayVerse(
      verse: 'Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão, e não se cansarão; andarão, e não se fatigarão.',
      reference: 'Isaías 40:31',
    ),
    BirthdayVerse(
      verse: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.',
      reference: 'Jeremias 29:11',
    ),
    BirthdayVerse(
      verse: 'O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti, e tenha misericórdia de ti; o Senhor sobre ti levante o seu rosto e te dê a paz.',
      reference: 'Números 6:24-26',
    ),
    BirthdayVerse(
      verse: 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
      reference: 'Provérbios 3:5-6',
    ),
    BirthdayVerse(
      verse: 'Porque para Deus nada é impossível.',
      reference: 'Lucas 1:37',
    ),
    BirthdayVerse(
      verse: 'Entrega o teu caminho ao Senhor; confia nele, e ele o fará.',
      reference: 'Salmos 37:5',
    ),
    BirthdayVerse(
      verse: 'O Senhor é o meu pastor; nada me faltará.',
      reference: 'Salmos 23:1',
    ),
    BirthdayVerse(
      verse: 'Tudo posso naquele que me fortalece.',
      reference: 'Filipenses 4:13',
    ),
    BirthdayVerse(
      verse: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
      reference: 'João 3:16',
    ),
    BirthdayVerse(
      verse: 'O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?',
      reference: 'Salmos 27:1',
    ),
    BirthdayVerse(
      verse: 'Tudo tem o seu tempo determinado, e há tempo para todo o propósito debaixo do céu.',
      reference: 'Eclesiastes 3:1',
    ),
    BirthdayVerse(
      verse: 'Os teus olhos viram o meu corpo ainda informe; e no teu livro todas estas coisas foram escritas; as quais em continuação foram formadas, quando nem ainda uma delas havia.',
      reference: 'Salmos 139:16',
    ),
    BirthdayVerse(
      verse: 'Porque eu sou o Senhor, teu Deus, que te seguro pela tua mão direita, e te digo: Não temas; eu te ajudarei.',
      reference: 'Isaías 41:13',
    ),
  ];
}

class BirthdayVerse {
  final String verse;
  final String reference;

  BirthdayVerse({
    required this.verse,
    required this.reference,
  });
}

