output "public_ip" {
  value = aws_instance.app.public_ip
}

# 最終的なIPを表示
output "app_url" {
  value = "https://${aws_eip.app_eip.public_ip}"
}
