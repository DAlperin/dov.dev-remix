FROM grafana/loki:main

ADD config.yaml /mnt/config.yaml

ENTRYPOINT [ "/usr/bin/loki" ]
CMD ["-config.file=/mnt/config.yaml"]
