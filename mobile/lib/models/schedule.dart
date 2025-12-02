import 'package:json_annotation/json_annotation.dart';

part 'schedule.g.dart';

@JsonSerializable()
class Schedule {
  final String id;
  final String ministryId;
  final String ministryName;
  final String title;
  final String? description;
  final DateTime date;
  final String? startTime;
  final String? endTime;
  final String? location;
  final String? role;
  final String status;
  final DateTime createdAt;

  Schedule({
    required this.id,
    required this.ministryId,
    required this.ministryName,
    required this.title,
    this.description,
    required this.date,
    this.startTime,
    this.endTime,
    this.location,
    this.role,
    required this.status,
    required this.createdAt,
  });

  factory Schedule.fromJson(Map<String, dynamic> json) => _$ScheduleFromJson(json);
  Map<String, dynamic> toJson() => _$ScheduleToJson(this);
}

