// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'schedule.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Schedule _$ScheduleFromJson(Map<String, dynamic> json) => Schedule(
  id: json['id'] as String,
  ministryId: json['ministryId'] as String,
  ministryName: json['ministryName'] as String,
  title: json['title'] as String,
  description: json['description'] as String?,
  date: DateTime.parse(json['date'] as String),
  startTime: json['startTime'] as String?,
  endTime: json['endTime'] as String?,
  location: json['location'] as String?,
  role: json['role'] as String?,
  status: json['status'] as String,
  createdAt: DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$ScheduleToJson(Schedule instance) => <String, dynamic>{
  'id': instance.id,
  'ministryId': instance.ministryId,
  'ministryName': instance.ministryName,
  'title': instance.title,
  'description': instance.description,
  'date': instance.date.toIso8601String(),
  'startTime': instance.startTime,
  'endTime': instance.endTime,
  'location': instance.location,
  'role': instance.role,
  'status': instance.status,
  'createdAt': instance.createdAt.toIso8601String(),
};
